import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/organization-structure.facade';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  ICreateOrganizationStructureModel,
  IOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { ORGANIZATION_STRUCTURE_EVENTS } from 'src/modules/actions-archive/modules/organization-structure/organization-structure.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateResourceEvent } from 'src/modules/actions-archive/events/base.events';
@Injectable()
export class CreateOrganizationStructureUseCase
  implements IUseCaseService<IOrganizationStructureModel>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    data: ICreateOrganizationStructureModel,
    admin: IAdminUserModel,
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

    const created = await this.organizationStructureFacade.create(data);

    this.actionsArchiveFacade.trackEvent(
      ORGANIZATION_STRUCTURE_EVENTS.CREATE,
      new CreateResourceEvent(created.id, admin),
    );

    return created;
  }
}
