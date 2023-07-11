import { Injectable } from '@nestjs/common';
import { RejectActivityLogDto } from 'src/api/activity-log/dto/reject-activity-log.dto';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';
import RejectHoursEvent from 'src/modules/notifications/events/volunteer-hours/reject-hours.event';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RejectActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    id: string,
    { rejectionReason }: RejectActivityLogDto,
    admin: IAdminUserModel,
  ): Promise<IActivityLogModel> {
    // 1. Check if the log to be updated, exists
    const log = await this.getOneActivityLogUsecase.execute(id);

    if (log.status === ActivityLogStatus.REJECTED) {
      return log;
    }

    const rejected = await this.activityLogFacade.update(id, {
      status: ActivityLogStatus.REJECTED,
      approvedById: null,
      approvedOn: null,
      rejectedById: admin.id,
      rejectedOn: new Date(),
      rejectionReason,
    });

    // send push notifications and or email
    this.eventEmitter.emit(
      EVENTS.VOLUNTEER_HOURS.REJECT,
      new RejectHoursEvent(
        rejected.organization.id,
        rejected.volunteer.user.id,
        rejected.organization.name,
        rejected.volunteer.user.notificationsSettings.notificationsViaPush,
        rejected.volunteer.user.notificationsSettings.notificationsViaEmail,
        rejected.volunteer.user.email,
        rejected.id,
        rejected.hours,
        rejected.createdOn,
      ),
    );

    // Track the event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS,
      {
        activityLogId: log.id,
        volunteerId: log.volunteer?.id,
        volunteerName: log.volunteer?.user?.name,
        oldStatus: log.status,
        newStatus: rejected.status,
      },
      admin,
    );

    return rejected;
  }
}
