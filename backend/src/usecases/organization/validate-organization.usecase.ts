import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

// A super admin validates a confirmed NGO: it becomes visible to volunteers and can run events and log hours.
@Injectable()
export class ValidateOrganizationUseCase
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly authMailer: AuthMailerService,
  ) {}

  async execute(
    organizationId: string,
    superAdminUserId: string,
  ): Promise<IOrganizationModel> {
    const organization = organizationId
      ? await this.organizationFacade.findOrganization({ id: organizationId })
      : null;
    if (!organization) {
      throw new NotFoundException(OrganizationExceptionMessages.ORG_001);
    }
    if (organization.validatedAt) return organization;
    // A pending NGO's admin has not confirmed the email yet; a suspended one is decided by unsuspend.
    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_005);
    }

    const validated = await this.organizationFacade.updateOrganization(
      organization.id,
      { validatedAt: new Date(), validatedById: superAdminUserId },
    );

    const admins = await this.authIdentityFacade.findByOrganizationId(
      organization.id,
    );
    if (admins.length) {
      await this.authMailer.send(
        admins.map((admin) => admin.email),
        AUTH_EMAILS.organizationValidated(
          organization.name,
          this.authMailer.loginUrl(),
        ),
      );
    }

    return validated;
  }
}
