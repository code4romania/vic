import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { IOrganizationWithVolunteersModel } from 'src/modules/organization/models/organization-with-volunteers.model';
import { FindManyOrganizationsOptions } from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetOrganizationsUseCase
  implements IUseCaseService<Pagination<IOrganizationWithVolunteersModel>>
{
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  public async execute(
    options: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationWithVolunteersModel>> {
    return this.organizationFacade.findOrganizations(options);
  }
}
