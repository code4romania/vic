import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import {
  CreateActivityTypeOptions,
  IActivityTypeModel,
} from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneOrganizationStructureUseCase } from '../organization/organization-structure/get-one-organization-structure.usecase';

@Injectable()
export class CreateActivityTypeUseCase
  implements IUseCaseService<IActivityTypeModel>
{
  constructor(
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    newActivityType: CreateActivityTypeOptions,
    admin: IAdminUserModel,
  ): Promise<IActivityTypeModel> {
    const activityType = await this.activityTypeFacade.find({
      name: newActivityType.name,
      organizationId: newActivityType.organizationId,
    });

    if (activityType) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_002,
      );
    }

    // Validate OrganizationStructures exist, are in the current organization and are correct (branch is branch, department is department, etc)
    try {
      if (newActivityType.branchId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: newActivityType.branchId,
          organizationId: newActivityType.organizationId,
          type: OrganizationStructureType.BRANCH,
        });
      if (newActivityType.departmentId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: newActivityType.departmentId,
          organizationId: newActivityType.organizationId,
          type: OrganizationStructureType.DEPARTMENT,
        });
      if (newActivityType.roleId)
        await this.getOneOrganizationStructureUseCase.execute({
          id: newActivityType.roleId,
          organizationId: newActivityType.organizationId,
          type: OrganizationStructureType.ROLE,
        });
    } catch (error) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_004,
      );
    }

    const created = await this.activityTypeFacade.create(newActivityType);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_ACTIVITY_TYPE,
      {
        activityTypeId: created.id,
        activityTypeName: created.name,
      },
      admin,
      admin.organizationId,
    );

    return created;
  }
}
