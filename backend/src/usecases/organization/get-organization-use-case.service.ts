import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization-facade.service';

@Injectable()
export class GetOrganizationUseCaseService
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationService: OrganizationFacadeService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(organizationId: string): Promise<IOrganizationModel> {
    // Get organization from the database
    const organization = await this.organizationService.getOrganizationById(
      organizationId,
    );

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
