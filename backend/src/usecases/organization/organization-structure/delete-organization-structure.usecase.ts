import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { DeleteResourceEvent } from 'src/modules/actions-archive/events/base.events';
import { ORGANIZATION_STRUCTURE_EVENTS } from 'src/modules/actions-archive/modules/organization-structure/organization-structure.model';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/organization-structure.facade';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneOrganizationStructureUseCase } from './get-one-organization-structure.usecase';

@Injectable()
export class DeleteOrganizationStructureUseCase
  implements IUseCaseService<string>
{
  constructor(
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string, admin: IAdminUserModel): Promise<string> {
    const toRemove = await this.getOneOrganizationStructureUseCase.execute({
      id,
    });

    const removed = await this.organizationStructureFacade.delete(id);

    if (!removed) {
      this.exceptionService.notFoundException(
        OrganizationStructureExceptionMessages.ORGANIZATION_STRUCTURE_001,
      );
    }

    this.actionsArchiveFacade.trackEvent(
      ORGANIZATION_STRUCTURE_EVENTS.DELETE,
      new DeleteResourceEvent(
        removed,
        admin,
        ObjectDiff.diff(toRemove, undefined),
      ),
    );

    return removed;
  }
}
