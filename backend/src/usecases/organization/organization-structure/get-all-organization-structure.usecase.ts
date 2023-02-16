import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  IFindAllOrganizationStructureModel,
  IOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';

@Injectable()
export class GetAllOrganizationStructureUseCase
  implements IUseCaseService<Pagination<IOrganizationStructureModel>>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
  ) {}

  public async execute(
    findOptions: IFindAllOrganizationStructureModel,
  ): Promise<Pagination<IOrganizationStructureModel>> {
    return this.organizationStructureFacade.findAll(findOptions);
  }
}
