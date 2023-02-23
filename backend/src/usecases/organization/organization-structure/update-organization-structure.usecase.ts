import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';

@Injectable()
export class UpdateOrganizationStructureUseCase
  implements IUseCaseService<IOrganizationStructureModel>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    data: IUpdateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    // 1. Find the record to be updated for duplicate check
    const toUpdate = await this.organizationStructureFacade.find({
      id: data.id,
    });

    if (!toUpdate) {
      this.exceptionService.notFoundException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_001,
      );
    }

    // 2. Find if there is any duplicate (Organization - Type - Name)
    const duplicate = await this.organizationStructureFacade.find({
      // id: Not(data.id), // TODO: open task to check how to add FindOptions here
      type: toUpdate.type,
      organizationId: toUpdate.organizationId,
      name: data.name,
    });

    if (duplicate && duplicate.id !== toUpdate.id) {
      this.exceptionService.badRequestException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_002,
      );
    }

    return this.organizationStructureFacade.update(data);
  }
}
