import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { isUniqueViolation } from 'src/infrastructure/filters/exception.filter';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import {
  NgoHubCallbackInput,
  NgoHubOidcService,
} from 'src/modules/auth/services/ngohub/ngohub-oidc.service';
import { NgoHubTicketService } from 'src/modules/auth/services/ngohub/ngohub-ticket.service';
import {
  NgoHubOrganizationClaim,
  NgoHubProfile,
} from 'src/modules/auth/services/ngohub/ngohub.types';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { normalizeCui } from 'src/modules/organization/cui';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserType } from 'src/modules/user/enums/user.enum';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource, EntityManager } from 'typeorm';
import { WebLoginResult } from './auth-results';
import { WebSessionHelper } from './web-session.helper';

// What the registration form starts from when NGO Hub's organization is new to VIC (issue 04). The CUI,
// the organization's name and the admin's email are locked: the registration takes them from the ticket.
export interface NgoHubRegistrationPrefill {
  organization: {
    name: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    website: string;
    logoUrl: string | null;
  };
  admin: { email: string; firstName: string; lastName: string };
}

export type NgoHubLoginResult =
  | { kind: 'session'; login: WebLoginResult }
  | {
      kind: 'register';
      ticket: string;
      prefill: NgoHubRegistrationPrefill;
    };

// Login with NGO Hub (OIDC) on the web, for NGO admins. NGO Hub only says who the person is and which
// organization they belong to; VIC decides what they get (NGO Hub plan, decision 5):
//  - a VIC login already linked to this NGO Hub account, or found by the verified email and of the same
//    organization (NGO Hub id, else exact CUI): logged in, linked, a pending login becomes active;
//  - no VIC login, an organization VIC knows (NGO Hub id, else exact CUI): an NGO Hub admin joins as an
//    admin (decision 4), the other admins get an "it was not us" link and the history records it; an
//    employee is told to ask for an invite (AUTH_017) and nothing is created;
//  - no VIC login, an organization VIC does not know: an admin gets a registration ticket (issue 04).
// A volunteer's app login with the same email does not matter: only web logins are looked at.
@Injectable()
export class NgoHubLoginUseCase implements IUseCaseService<NgoHubLoginResult> {
  private readonly logger = new Logger(NgoHubLoginUseCase.name);

  constructor(
    private readonly ngohub: NgoHubOidcService,
    private readonly tickets: NgoHubTicketService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly userFacade: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authMailer: AuthMailerService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly webSession: WebSessionHelper,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    input: NgoHubCallbackInput,
    client: SessionClient = {},
  ): Promise<NgoHubLoginResult> {
    const profile = await this.ngohub.callback(input);
    if (!profile.email || !profile.emailVerified) {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
    const claim = profile.organization;
    if (!claim?.id) {
      this.logger.warn(`NGO Hub user ${profile.subject} has no organization`);
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }
    const taxId = normalizeCui(String(claim.cui ?? '')) || null;

    const linked = await this.authIdentityFacade.findProviderLink(
      AuthProvider.NGOHUB,
      profile.subject,
    );
    let identity = linked
      ? await this.authIdentityFacade.findIdentity({ id: linked.identityId })
      : null;
    if (!identity) {
      identity = await this.authIdentityFacade.findIdentity({
        realm: AuthRealm.WEB,
        email: profile.email,
      });
      if (identity) {
        const other = await this.authIdentityFacade.findProviderLinkOf(
          identity.id,
          AuthProvider.NGOHUB,
        );
        if (other && other.subject !== profile.subject) {
          throw new AuthException(AuthExceptionCodes.AUTH_018);
        }
      }
    }

    if (identity) {
      const login = await this.loginExisting(
        identity,
        profile,
        taxId,
        !linked,
        client,
      );
      return { kind: 'session', login };
    }

    if (claim.role !== 'admin') {
      throw new AuthException(AuthExceptionCodes.AUTH_017);
    }

    const organization = await this.organizationFacade.findForNgoHub(
      claim.id,
      taxId,
    );
    if (organization) {
      const login = await this.joinAsAdmin(
        organization,
        profile,
        taxId,
        client,
      );
      return { kind: 'session', login };
    }

    const ticket = await this.tickets.issue(profile, input.flowCookie);
    return { kind: 'register', ticket, prefill: ngohubPrefill(profile) };
  }

  private async loginExisting(
    identity: IAuthIdentityModel,
    profile: NgoHubProfile,
    taxId: string,
    link: boolean,
    client: SessionClient,
  ): Promise<WebLoginResult> {
    if (identity.realm !== AuthRealm.WEB) {
      throw new AuthException(AuthExceptionCodes.AUTH_016);
    }
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }
    // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
    const admin = identity.userId
      ? await this.userFacade.findAdminUser({ id: identity.userId })
      : null;
    const organization = admin?.organizationId
      ? await this.organizationFacade.findOrganization({
          id: admin.organizationId,
        })
      : null;
    if (
      !organization ||
      !sameOrganization(organization, profile.organization, taxId)
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_016);
    }
    // A registration whose email was never confirmed is finished by its emailed link only.
    if (organization.status === OrganizationStatus.PENDING) {
      throw new AuthException(AuthExceptionCodes.AUTH_003);
    }

    const updated = await this.dataSource
      .transaction(async (manager) => {
        const current = await this.authIdentityFacade.updateIdentity(
          identity.id,
          {
            emailVerifiedAt: identity.emailVerifiedAt ?? new Date(),
            ...(identity.status === AuthIdentityStatus.PENDING
              ? { status: AuthIdentityStatus.ACTIVE }
              : {}),
          },
          manager,
        );
        if (link) {
          await this.authIdentityFacade.linkProvider(
            {
              identityId: identity.id,
              provider: AuthProvider.NGOHUB,
              subject: profile.subject,
              emailAtLink: profile.email,
            },
            manager,
          );
        }
        await this.linkOrganization(
          organization,
          profile.organization,
          manager,
        );
        return current;
      })
      .catch((error) => this.uniqueToAuthError(error));

    return this.webSession.start(updated, client);
  }

  private async joinAsAdmin(
    organization: IOrganizationModel,
    profile: NgoHubProfile,
    taxId: string,
    client: SessionClient,
  ): Promise<WebLoginResult> {
    if (organization.status === OrganizationStatus.SUSPENDED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }
    if (organization.status === OrganizationStatus.PENDING) {
      throw new AuthException(AuthExceptionCodes.AUTH_003);
    }
    // An admin profile without a web login (e.g. never migrated) is taken over only in its own organization.
    const existingAdmin = await this.userFacade.findAdminUser({
      email: profile.email,
    });
    if (existingAdmin && existingAdmin.organizationId !== organization.id) {
      throw new AuthException(AuthExceptionCodes.AUTH_016);
    }

    const { admin, identity, revokeSecret } = await this.dataSource
      .transaction(async (manager) => {
        // One change to an NGO's team at a time, like the Team page.
        await manager.query(
          `SELECT id FROM organization WHERE id = $1 FOR UPDATE`,
          [organization.id],
        );
        const admin =
          existingAdmin ??
          (await this.userFacade.createAdmin(
            {
              name: profile.name?.trim() || profile.email,
              email: profile.email,
              phone: null,
              organizationId: organization.id,
              language: null,
            },
            manager,
          ));
        const identity = await this.authIdentityFacade.createIdentity(
          {
            realm: AuthRealm.WEB,
            email: profile.email,
            status: AuthIdentityStatus.ACTIVE,
            emailVerifiedAt: new Date(),
            userId: admin.id,
          },
          manager,
        );
        await this.authIdentityFacade.linkProvider(
          {
            identityId: identity.id,
            provider: AuthProvider.NGOHUB,
            subject: profile.subject,
            emailAtLink: profile.email,
          },
          manager,
        );
        await this.linkOrganization(
          organization,
          profile.organization,
          manager,
        );
        const { secret } = await this.oneTimeTokenService.issue(
          {
            identity,
            type: AuthTokenType.NGOHUB_REVOKE,
            form: AuthTokenForm.LINK,
            sentTo: organization.email,
          },
          manager,
        );
        return { admin, identity, revokeSecret: secret };
      })
      .catch((error) => this.uniqueToAuthError(error));

    this.logger.log(
      `NGO Hub admin ${profile.subject} joined organization ${organization.id} as admin ${admin.id} (CUI ${taxId})`,
    );
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.NGOHUB_ADMIN_JOINED,
      {
        adminId: admin.id,
        adminName: admin.name,
        ngohubOrganizationId: profile.organization.id,
        taxId,
      },
      admin,
    );
    await this.notifyOtherAdmins(organization, identity, admin, revokeSecret);

    return this.webSession.start(identity, client);
  }

  private async notifyOtherAdmins(
    organization: IOrganizationModel,
    joined: IAuthIdentityModel,
    admin: { name: string; email: string },
    revokeSecret: string,
  ): Promise<void> {
    const others = (
      await this.authIdentityFacade.findByOrganizationId(organization.id)
    )
      .filter(
        (other) =>
          other.id !== joined.id &&
          other.status !== AuthIdentityStatus.DISABLED,
      )
      .map((other) => other.email);
    if (!others.length) return;

    try {
      await this.authMailer.sendToEach(
        others,
        UserType.ADMIN,
        AUTH_EMAILS.ngohubAdminJoined(
          this.authMailer.ngohubRevokeUrl(revokeSecret),
          organization.name,
          admin.name,
          admin.email,
        ),
      );
    } catch (error) {
      // The admin is in and the history has it; a lost email must not undo the login.
      this.logger.error(
        `Could not email the admins of ${organization.id} about NGO Hub admin ${joined.id}: ${error}`,
      );
    }
  }

  // The organization remembers its NGO Hub id the first time it is matched by CUI.
  private async linkOrganization(
    organization: IOrganizationModel,
    claim: NgoHubOrganizationClaim,
    manager: EntityManager,
  ): Promise<void> {
    if (organization.ngohubOrganizationId) return;
    await this.organizationFacade.updateOrganization(
      organization.id,
      { ngohubOrganizationId: claim.id },
      manager,
    );
  }

  // Two NGO Hub logins racing for the same link or organization: the unique keys refuse the second.
  private uniqueToAuthError(error: unknown): never {
    if (isUniqueViolation(error)) {
      const constraint = (error as { constraint?: string }).constraint ?? '';
      if (constraint.startsWith('auth_identity_provider')) {
        throw new AuthException(AuthExceptionCodes.AUTH_018);
      }
      if (constraint.startsWith('organization_ngohub')) {
        throw new AuthException(AuthExceptionCodes.AUTH_016);
      }
      throw new AuthException(AuthExceptionCodes.AUTH_009);
    }
    throw error;
  }
}

function sameOrganization(
  organization: IOrganizationModel,
  claim: NgoHubOrganizationClaim,
  taxId: string,
): boolean {
  if (organization.ngohubOrganizationId) {
    return organization.ngohubOrganizationId === claim.id;
  }
  return !!taxId && organization.taxId === taxId;
}

const joined = (...parts: (string | null | undefined)[]): string =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

// Only the fields VIC already has (decision 7). Address: NGO Hub's `address` with its city and county.
export function ngohubPrefill(
  profile: NgoHubProfile,
): NgoHubRegistrationPrefill {
  const claim = profile.organization;
  const [firstName, ...rest] = (profile.name ?? '').trim().split(/\s+/);
  return {
    organization: {
      name: claim.name?.trim() ?? '',
      taxId: normalizeCui(String(claim.cui ?? '')),
      email: claim.email ?? '',
      phone: claim.phone ?? '',
      address: joined(
        claim.address,
        claim.city?.name,
        claim.county?.name ? `jud. ${claim.county.name}` : null,
      ),
      description: claim.short_description ?? '',
      website: claim.website ?? '',
      logoUrl: claim.logo_url ?? null,
    },
    admin: {
      email: profile.email,
      firstName: firstName ?? '',
      lastName: rest.join(' '),
    },
  };
}
