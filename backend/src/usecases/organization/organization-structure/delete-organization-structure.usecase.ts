import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneOrganizationStructureUseCase } from './get-one-organization-structure.usecase';
import { ActionsType } from 'src/modules/actions-archive/enums/action-types.enum';
import { ActionsResourceType } from 'src/modules/actions-archive/enums/action-resource-types.enum';

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

    this.actionsArchiveFacade.trackEvent({
      actionType: ActionsType.DELETE,
      resourceType: ActionsResourceType.ORG_STRUCTURE,
      resourceId: toRemove.id,
      author: admin,
      changes: ObjectDiff.diff(toRemove, undefined),
    });

    return removed;
  }
}
