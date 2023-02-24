import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';

@Injectable()
export class GetAllOrganizationStructureByTypeUseCase
  implements IUseCaseService<IOrganizationStructureModel[]>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
  ) {}

  public async execute(
    type: OrganizationStructureType,
    organizationId: string,
  ): Promise<IOrganizationStructureModel[]> {
    return this.organizationStructureFacade.findAll(type, organizationId);
  }
}
