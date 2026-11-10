import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import {
  IActivityLogModel,
  UpdateActivityLogOptions,
} from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { GetOneEventUseCase } from '../event/get-one-event.usecase';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';
import { assertVolunteerEditable } from 'src/modules/volunteer/volunteer-status.rules';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

@Injectable()
export class UpdateActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly getOneEventUsecase: GetOneEventUseCase,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    updates: UpdateActivityLogOptions,
    author: IAdminUserModel | IRegularUserModel,
  ): Promise<IActivityLogModel> {
    // 1. Check if the log to be updated, exists
    const log = await this.getOneActivityLogUsecase.execute(id);
    // An inactive or blocked volunteer's hours are read-only
    assertVolunteerEditable(log.volunteer);

    // 2. Allow updates only for PENDING requests
    if (log.status !== ActivityLogStatus.PENDING) {
      this.exceptionService.badRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_003,
      );
    }

    // 3. Check if the updated event exists in the organization and is different
    if (updates.eventId && log.event?.id !== updates.eventId) {
      await this.getOneEventUsecase.execute({
        id: updates.eventId,
        organizationId: log.organization?.id ?? log.event?.organization?.id,
      });
    }
    // 4. Check if the task exists in the organization
    if (updates.activityTypeId) {
      const taskExists = await this.activityTypeFacade.exists(
        [updates.activityTypeId],
        { organizationId: log.event?.organization.id || log.organization.id }, // in case the organization doesn't have an event associated with it
      );
      if (!taskExists) {
        this.exceptionService.badRequestException(
          ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
        );
      }
    }

    // a field left out stays as it is; null clears the event or the type
    const updated = await this.activityLogFacade.update(id, {
      ...updates,
      ...(updates.activityTypeId !== undefined
        ? { activityTypeId: (updates.activityTypeId || null) as never }
        : {}),
    });

    // #593: edits are in the actions history, also when the volunteer is the author
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.UPDATE_ACTIVITY_LOG,
      {
        activityLogId: log.id,
        volunteerId: log.volunteer?.id,
        volunteerName: log.volunteer?.user?.name,
        organizationId: log.organization?.id,
      },
      author,
    );

    return updated;
  }
}
