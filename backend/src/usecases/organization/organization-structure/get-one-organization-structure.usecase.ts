import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  IFindOrganizationStructureModel,
  IOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';

@Injectable()
export class GetOneOrganizationStructureUseCase
  implements IUseCaseService<IOrganizationStructureModel>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    findOptions: IFindOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const organizationStructure = await this.organizationStructureFacade.find(
      findOptions,
    );

    if (!organizationStructure) {
      this.exceptionService.notFoundException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_001,
      );
    }

    return organizationStructure;
  }
}
