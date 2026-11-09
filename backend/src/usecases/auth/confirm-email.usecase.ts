import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource, EntityManager } from 'typeorm';
import { LinkResult } from './auth-results';
import { WebSessionHelper } from './web-session.helper';

// A verify_email link. Mobile: the email is confirmed and the page sends the volunteer back to the app
// (no session, decisions R17). Web: the first admin of a newly registered NGO; the NGO goes from pending to
// active in the same transaction, the super admins are told, and the admin is logged in. A link for an NGO
// that is already active just logs in.
@Injectable()
export class ConfirmEmailUseCase implements IUseCaseService<LinkResult> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly webSession: WebSessionHelper,
    private readonly dataSource: DataSource,
    private readonly userFacade: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly authMailer: AuthMailerService,
  ) {}

  async execute(
    secret: string,
    client: SessionClient = {},
  ): Promise<LinkResult> {
    const token = await this.oneTimeTokenService.peekLink(
      secret,
      AuthTokenType.VERIFY_EMAIL,
    );
    const identity = token?.identity;
    if (!identity) throw new AuthException(AuthExceptionCodes.AUTH_005);
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    let activated: { organization: IOrganizationModel; admin: IAdminUserModel };
    const confirmed = await this.dataSource.transaction(async (manager) => {
      await this.oneTimeTokenService.consume(token, manager);
      const updated = await this.authIdentityFacade.updateIdentity(
        identity.id,
        {
          emailVerifiedAt: identity.emailVerifiedAt ?? new Date(),
          // The NGO's first admin logs in here for the first time (VIC 2.0, #514: no password)
          ...(identity.status === AuthIdentityStatus.PENDING
            ? { status: AuthIdentityStatus.ACTIVE }
            : {}),
        },
        manager,
      );
      if (updated.realm === AuthRealm.WEB) {
        activated = await this.activatePendingOrganization(
          updated.userId,
          manager,
        );
      }
      return updated;
    });

    if (activated) {
      await this.notifySuperAdmins(activated.organization, activated.admin);
    }

    return confirmed.realm === AuthRealm.WEB
      ? this.webSession.start(confirmed, client)
      : { realm: AuthRealm.MOBILE, email: confirmed.email };
  }

  private async activatePendingOrganization(
    userId: string,
    manager: EntityManager,
  ): Promise<{ organization: IOrganizationModel; admin: IAdminUserModel }> {
    // Checked before each lookup: TypeORM drops an undefined where key and would return the first row.
    const admin = userId
      ? await this.userFacade.findAdminUser({ id: userId })
      : null;
    const organization = admin?.organizationId
      ? await this.organizationFacade.findOrganization({
          id: admin.organizationId,
        })
      : null;
    if (organization?.status !== OrganizationStatus.PENDING) return undefined;

    const active = await this.organizationFacade.updateOrganization(
      organization.id,
      { status: OrganizationStatus.ACTIVE },
      manager,
    );
    return { organization: active, admin };
  }

  // The "new NGO to validate" email, with every field and a link to the validation page.
  private async notifySuperAdmins(
    organization: IOrganizationModel,
    admin: IAdminUserModel,
  ): Promise<void> {
    const superAdmins = await this.authIdentityFacade.findSuperAdmins();
    if (!superAdmins.length) return;

    await this.authMailer.send(
      superAdmins.map((superAdmin) => superAdmin.email),
      AUTH_EMAILS.organizationRegistered(
        organization,
        { name: admin.name, email: admin.email, phone: admin.phone },
        this.authMailer.validationPageUrl(),
      ),
    );
  }
}
