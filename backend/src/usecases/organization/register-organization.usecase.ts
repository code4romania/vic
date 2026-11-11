import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { S3_FILE_PATHS } from 'src/common/constants/constants';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource } from 'typeorm';
import { isUniqueViolation } from 'src/infrastructure/filters/exception.filter';

export interface RegisterOrganizationOptions {
  name: string;
  email: string;
  phone: string;
  // #469: optional, filled in later from the Organization page
  address?: string;
  description?: string;
  website?: string;
  taxId: string;
  firstName: string;
  lastName: string;
  adminEmail: string;
  adminPhone: string;
}

export interface RegisterOrganizationFiles {
  logo?: Express.Multer.File;
}

export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

// A new NGO registers in VIC (decision 4). It starts `pending`; its first admin confirms the email
// (ConfirmEmailUseCase activates it), and it stays hidden from volunteers until a super admin validates it.
@Injectable()
export class RegisterOrganizationUseCase
  implements IUseCaseService<{ maskedEmail: string }>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly userFacade: UserFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authMailer: AuthMailerService,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    options: RegisterOrganizationOptions,
    files: RegisterOrganizationFiles,
  ): Promise<{ maskedEmail: string }> {
    // 1. The logo, when given, is an image (#469: no statute, the CUI is what gets validated)
    if (files.logo && !isLogoImage(files.logo)) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_003);
    }

    // 2. Unique name, email, phone and tax id ignoring case, and an admin email not already a web login (409 ORG_004)
    await this.assertUnique(options);

    // 3. One transaction: organization, its first admin, the admin's login, the files, the confirmation link
    const { admin, secret } = await this.dataSource
      .transaction(async (manager) => {
        const organization = await this.organizationFacade.createOrganization(
          {
            name: options.name.trim(),
            email: options.email,
            phone: options.phone.trim(),
            address: options.address ?? null,
            activityArea: null,
            description: options.description ?? null,
            website: options.website ?? null,
            taxId: options.taxId.trim(),
            logo: null,
            status: OrganizationStatus.PENDING,
            // #510: the DTO only gets here with both declarations ticked
            selfDeclaredAt: new Date(),
          },
          manager,
        );

        const folder = `${S3_FILE_PATHS.ORGANIZATIONS}/${organization.id}`;
        if (files.logo) {
          await this.organizationFacade.updateOrganization(
            organization.id,
            { logo: await this.s3Service.uploadPublicFile(folder, files.logo) },
            manager,
          );
        }

        const adminUser = await this.userFacade.createAdmin(
          {
            name: `${options.firstName.trim()} ${options.lastName.trim()}`,
            email: options.adminEmail,
            phone: options.adminPhone.trim(),
            organizationId: organization.id,
          },
          manager,
        );
        const identity = await this.authIdentityFacade.createIdentity(
          {
            realm: AuthRealm.WEB,
            email: options.adminEmail,
            // The confirmation link logs the admin in and activates the login (VIC 2.0, #514: no password)
            status: AuthIdentityStatus.PENDING,
            userId: adminUser.id,
          },
          manager,
        );
        const issued = await this.oneTimeTokenService.issue(
          {
            identity,
            type: AuthTokenType.VERIFY_EMAIL,
            form: AuthTokenForm.LINK,
          },
          manager,
        );

        return { admin: identity, secret: issued.secret, organization };
      })
      .catch((error) => {
        // Two registrations with the same data at once both pass assertUnique; the unique index refuses
        // the second, which gets the same 409 ORG_004 as it would have a moment later.
        if (isUniqueViolation(error)) {
          throw new ConflictException(OrganizationExceptionMessages.ORG_004);
        }
        throw error;
      });

    // 4. After the commit: the 24 h confirmation link
    await this.authMailer.send(
      admin.email,
      AUTH_EMAILS.confirmOrganizationLink(
        this.authMailer.confirmEmailUrl(secret),
        options.name.trim(),
      ),
    );

    return { maskedEmail: this.oneTimeTokenService.maskEmail(admin.email) };
  }

  private async assertUnique(
    options: RegisterOrganizationOptions,
  ): Promise<void> {
    const conflicts = await this.organizationFacade.findConflicts({
      name: options.name,
      email: options.email,
      phone: options.phone,
      taxId: options.taxId,
    });
    const login = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.WEB,
      email: options.adminEmail,
    });
    const adminUser = await this.userFacade.findAdminUser({
      email: options.adminEmail,
    });
    if (conflicts.length || login || adminUser) {
      throw new ConflictException(OrganizationExceptionMessages.ORG_004);
    }
  }
}

// The image types a logo may be, told apart by their first bytes. No SVG: it can carry scripts, and logos
// are served from the public bucket.
const LOGO_SIGNATURES: {
  mimetype: string;
  matches: (head: Buffer) => boolean;
}[] = [
  {
    mimetype: 'image/png',
    matches: (head) =>
      head
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mimetype: 'image/jpeg',
    matches: (head) =>
      head.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  },
  {
    mimetype: 'image/gif',
    matches: (head) =>
      ['GIF87a', 'GIF89a'].includes(head.subarray(0, 6).toString('latin1')),
  },
  {
    mimetype: 'image/webp',
    matches: (head) =>
      head.subarray(0, 4).toString('latin1') === 'RIFF' &&
      head.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

// A PNG, JPEG, GIF or WebP of at most 5 MB, whose content matches the type it was sent as (that type is
// what the public bucket serves it with).
export function isLogoImage(file: Express.Multer.File): boolean {
  return (
    !!file?.buffer &&
    file.size <= LOGO_MAX_BYTES &&
    LOGO_SIGNATURES.some(
      ({ mimetype, matches }) =>
        file.mimetype === mimetype && matches(file.buffer),
    )
  );
}
