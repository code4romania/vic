import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyOrganizationsOptions,
  IOrganizationModel,
} from 'src/modules/organization/models/organization.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';

@Injectable()
export class GetOrganizationsUseCase
  implements IUseCaseService<Pagination<IOrganizationModel>>
{
  constructor(private readonly organizationFacade: OrganizationFacadeService) {}

  public async execute(
    options: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationModel>> {
    return this.organizationFacade.findOrganizations(options);
  }
}
