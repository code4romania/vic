import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { OrganizatinVolunteerStatus } from 'src/modules/organization/enums/organization-volunteer-status.enum';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

@Injectable()
export class GetOrganizationWithEventsUseCase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly organizationService: OrganizationFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly accessRequestFacade: AccessRequestFacade,
  ) {}

  public async execute(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. Get organization from the database
    const organization =
      await this.organizationService.findOrganizationWithEvents(
        organizationId,
        userId,
      );

    // 2. If organization is not found throw error or volunteer is blocked
    if (
      !organization ||
      (organization.volunteers.length > 0 &&
        organization.volunteers[0].status === VolunteerStatus.BLOCKED)
    ) {
      this.exceptionService.notFoundException(
        OrganizationExceptionMessages.ORG_001,
      );
    }

    // 3. Check if the user has access request pending for this organization
    const accessRequest = await this.accessRequestFacade.find({
      organizationId,
      requestedById: userId,
      status: AccessRequestStatus.PENDING,
    });

    if (accessRequest) {
      organization.organizationVolunteerStatus =
        OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING;
    }

    if (organization.volunteers.length > 0) {
      organization.organizationVolunteerStatus =
        organization.volunteers[0].status === VolunteerStatus.ARCHIVED
          ? OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER
          : OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER;
    }

    // 4. Send the organization back to the caller
    return organization;
  }
}
