import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  ICreateOrganizationStructureModel,
  IOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';

@Injectable()
export class CreateOrganizationStructureUseCase
  implements IUseCaseService<IOrganizationStructureModel>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    data: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const structure = await this.organizationStructureFacade.find({
      name: data.name,
      type: data.type,
      organizationId: data.organizationId,
    });

    if (structure) {
      this.exceptionService.badRequestException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_002,
      );
    }

    return this.organizationStructureFacade.create(data);
  }
}
