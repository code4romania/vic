import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { UpdateResourceEvent } from 'src/modules/actions-archive/events/base.events';
import { ORGANIZATION_STRUCTURE_EVENTS } from 'src/modules/actions-archive/modules/organization-structure/organization-structure.model';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/organization-structure.facade';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class UpdateOrganizationStructureUseCase
  implements IUseCaseService<IOrganizationStructureModel>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    data: IUpdateOrganizationStructureModel,
    admin: IAdminUserModel,
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
      type: toUpdate.type,
      organizationId: toUpdate.organizationId,
      name: data.name,
    });

    if (duplicate && duplicate.id !== toUpdate.id) {
      this.exceptionService.badRequestException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_002,
      );
    }

    const updated = await this.organizationStructureFacade.update(data);

    this.actionsArchiveFacade.trackEvent(
      ORGANIZATION_STRUCTURE_EVENTS.EDIT,
      new UpdateResourceEvent(
        updated.id,
        admin,
        ObjectDiff.diff(toUpdate, updated),
      ),
    );

    return updated;
  }
}
