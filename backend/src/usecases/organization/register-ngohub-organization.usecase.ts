import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { isUniqueViolation } from 'src/infrastructure/filters/exception.filter';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { NgoHubTicketService } from 'src/modules/auth/services/ngohub/ngohub-ticket.service';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { normalizeCui } from 'src/modules/organization/cui';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { Language } from 'src/modules/user/enums/user.enum';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource } from 'typeorm';
import { WebLoginResult } from '../auth/auth-results';
import { WebSessionHelper } from '../auth/web-session.helper';
import { NgoHubLogoFetcher } from './ngohub-logo.fetcher';
import { isLogoImage } from './register-organization.usecase';

// What the admin may change on the prefilled form. The CUI, the organization's name and the admin's
// email are not here: they come from the ticket.
export interface RegisterNgoHubOrganizationOptions {
  email: string;
  phone: string;
  address?: string;
  description?: string;
  website?: string;
  firstName: string;
  lastName: string;
  adminPhone: string;
  // Copy the logo NGO Hub has (when no file is uploaded)
  useNgoHubLogo?: boolean;
}

// Login with NGO Hub, issue 04: an NGO Hub admin registers an NGO VIC does not know yet, from the
// registration ticket the login gave them (30 minutes, once, this browser only). NGO Hub already vouches
// for the organization, so it starts ACTIVE and validated, without the self-declaration (only the terms),
// linked to its NGO Hub id; the admin is logged in at once, their login linked to the NGO Hub account.
@Injectable()
export class RegisterNgoHubOrganizationUseCase
  implements IUseCaseService<WebLoginResult>
{
  private readonly logger = new Logger(RegisterNgoHubOrganizationUseCase.name);

  constructor(
    private readonly tickets: NgoHubTicketService,
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly userFacade: UserFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly logoFetcher: NgoHubLogoFetcher,
    private readonly s3Service: S3Service,
    private readonly webSession: WebSessionHelper,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    ticket: string,
    flowCookie: string,
    options: RegisterNgoHubOrganizationOptions,
    files: { logo?: Express.Multer.File },
    language?: Language | null,
    client: SessionClient = {},
  ): Promise<WebLoginResult> {
    if (files.logo && !isLogoImage(files.logo)) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_003);
    }

    // Used up here, whatever happens next: a ticket never works twice.
    const profile = await this.tickets.take(ticket, flowCookie);
    const claim = profile.organization;
    if (!claim?.id || claim.role !== 'admin' || !profile.email) {
      throw new AuthException(AuthExceptionCodes.AUTH_019);
    }
    const name = claim.name?.trim();
    const taxId = normalizeCui(String(claim.cui ?? ''));
    const adminEmail = profile.email;

    // Since the ticket: someone may have registered the NGO, or this person may have a login now.
    const known = await this.organizationFacade.findForNgoHub(claim.id, taxId);
    const conflicts = await this.organizationFacade.findConflicts({
      name,
      email: options.email,
      phone: options.phone,
      taxId,
    });
    const login = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.WEB,
      email: adminEmail,
    });
    const adminUser = await this.userFacade.findAdminUser({
      email: adminEmail,
    });
    if (known || conflicts.length || login || adminUser) {
      throw new ConflictException(OrganizationExceptionMessages.ORG_004);
    }

    const logo =
      files.logo ??
      (options.useNgoHubLogo && claim.logo_url
        ? await this.logoFetcher.fetch(claim.logo_url)
        : null);

    const identity = await this.dataSource
      .transaction(async (manager) => {
        const now = new Date();
        const organization = await this.organizationFacade.createOrganization(
          {
            name,
            email: options.email,
            phone: options.phone.trim(),
            address: options.address ?? null,
            activityArea: null,
            description: options.description ?? null,
            website: options.website ?? null,
            taxId,
            logo: null,
            status: OrganizationStatus.ACTIVE,
            ngohubOrganizationId: claim.id,
          },
          manager,
        );
        await this.organizationFacade.updateOrganization(
          organization.id,
          {
            validatedAt: now,
            ...(logo
              ? {
                  logo: await this.s3Service.uploadPublicFile(
                    `${S3_FILE_PATHS.ORGANIZATIONS}/${organization.id}`,
                    logo,
                  ),
                }
              : {}),
          },
          manager,
        );

        const admin = await this.userFacade.createAdmin(
          {
            name: `${options.firstName.trim()} ${options.lastName.trim()}`,
            email: adminEmail,
            phone: options.adminPhone.trim(),
            organizationId: organization.id,
            language: language ?? null,
          },
          manager,
        );
        const identity = await this.authIdentityFacade.createIdentity(
          {
            realm: AuthRealm.WEB,
            email: adminEmail,
            status: AuthIdentityStatus.ACTIVE,
            emailVerifiedAt: now,
            userId: admin.id,
          },
          manager,
        );
        await this.authIdentityFacade.linkProvider(
          {
            identityId: identity.id,
            provider: AuthProvider.NGOHUB,
            subject: profile.subject,
            emailAtLink: adminEmail,
          },
          manager,
        );
        return identity;
      })
      .catch((error) => {
        // Two registrations at once both pass the checks above; the unique indexes refuse the second.
        if (isUniqueViolation(error)) {
          throw new ConflictException(OrganizationExceptionMessages.ORG_004);
        }
        throw error;
      });

    this.logger.log(
      `NGO Hub organization ${claim.id} (CUI ${taxId}) registered by NGO Hub user ${profile.subject}`,
    );
    return this.webSession.start(identity, client);
  }
}
