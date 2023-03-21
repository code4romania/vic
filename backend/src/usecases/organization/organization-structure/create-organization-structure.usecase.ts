import { Injectable } from '@nestjs/common';
import { ObjectDiff } from 'src/common/helpers/object-diff';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { ActionsResourceType } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActionsType } from 'src/modules/actions-archive/enums/action-types.enum';
import { OrganizationStructureExceptionMessages } from 'src/modules/organization/exceptions/organization-structure.exceptions';
import {
  ICreateOrganizationStructureModel,
  IOrganizationStructureModel,
} from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
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

    // @birloiflorian ma gandeam sa facem o clasa abstracta care sa injecteze actionsArchive si sa faca trackEvent intern, iar noi pe super() sa-i trimitem actionType si resourceType
    // iar aici doar apelam trackEvent (care vine din clasa abstracta) cu resourceId, author, changes
    this.actionsArchiveFacade.trackEvent({
      actionType: ActionsType.CREATE,
      resourceType: ActionsResourceType.ORG_STRUCTURE,
      resourceId: created.id,
      author: admin,
      changes: ObjectDiff.diff(undefined, created),
    });

    return created;
  }
}
