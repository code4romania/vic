import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class ActivateActivityTypeUseCase
  implements IUseCaseService<IActivityTypeModel>
{
  constructor(
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    admin: IAdminUserModel,
  ): Promise<IActivityTypeModel> {
    const toUpdate = await this.activityTypeFacade.find({ id });

    if (!toUpdate) {
      this.exceptionService.notFoundException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
      );
    }

    if (toUpdate.status == ActivityTypeStatus.ACTIVE) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_003,
      );
    }

    const updated = await this.activityTypeFacade.activate(id);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_ACTIVITY_TYPE_STATUS,
      {
        activityTypeId: updated.id,
        activityTypeName: updated.name,
        oldStatus: toUpdate.status,
        newStatus: updated.status,
      },
      admin,
      admin.organizationId,
    );

    return updated;
  }
}
