import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetOrganizationWithEventsUseCase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly organizationService: OrganizationFacadeService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    organizationId: string,
  ): Promise<IOrganizationWithEventsModel> {
    // Get organization from the database
    const organization =
      await this.organizationService.findOrganizationWithEvents(organizationId);

    // If organization is not found throw error
    if (!organization) {
      this.exceptionService.notFoundException(
        OrganizationExceptionMessages.ORG_001,
      );
    }

    // Send the organization back to the caller
    return organization;
  }
}
