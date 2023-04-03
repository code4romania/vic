import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';

@Injectable()
export class ApproveActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    id: string,
    admin: IAdminUserModel,
  ): Promise<IActivityLogModel> {
    // 1. Check if the log to be updated, exists
    const log = await this.getOneActivityLogUsecase.execute(id);

    if (log.status === ActivityLogStatus.APPROVED) {
      return log;
    }

    const approved = await this.activityLogFacade.update(id, {
      status: ActivityLogStatus.APPROVED,
      approvedById: admin.id,
      approvedOn: new Date(),
      rejectedById: null,
      rejectedOn: null,
      rejectionReason: null,
    });

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS,
      {
        activityLogId: log.id,
        volunteerId: log.volunteer?.id,
        volunteerName: log.volunteer?.user?.name,
        oldStatus: log.status,
        newStatus: approved.status,
      },
      admin,
    );

    return approved;
  }
}
