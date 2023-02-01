import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import {
  OrganizationExceptionCodes,
  OrganizationExceptionMessages,
} from 'src/modules/organization/exceptions/exceptions';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization-facade.service';

@Injectable()
export class UpdateOrganizationDescriptionUseCaseService
  implements IUseCaseService<IOrganizationModel>
{
  constructor(
    private readonly organizationService: OrganizationFacadeService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    id: string,
    description: string,
  ): Promise<IOrganizationModel> {
    // get organization
    const organization = await this.organizationService.getOrganizationById(id);

    // throw not found error if the organization doesn't exist
    if (!organization) {
      this.exceptionService.notFoundException({
        message: OrganizationExceptionMessages.ORG_001,
        error_key: OrganizationExceptionCodes.ORG_001,
      });
    }

    // update organization
    const updatedOrganization =
      await this.organizationService.updateOrganizationDescription(
        id,
        description,
      );

    // return organization with updated fields
    return updatedOrganization;
  }
}
