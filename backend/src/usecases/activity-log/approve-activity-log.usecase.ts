import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
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

    return this.activityLogFacade.update(id, {
      status: ActivityLogStatus.APPROVED,
      approvedById: admin.id,
      approvedOn: new Date(),
      rejectedById: null,
      rejectedOn: null,
      rejectionReason: null,
    });
  }
}
