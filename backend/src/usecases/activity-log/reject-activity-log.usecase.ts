import { Injectable } from '@nestjs/common';
import { RejectActivityLogDto } from 'src/api/activity-log/dto/reject-activity-log.dto';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';

@Injectable()
export class RejectActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly activityLogFacade: ActivityLogFacade,
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

    return this.activityLogFacade.update(id, {
      status: ActivityLogStatus.REJECTED,
      approvedById: null,
      approvedOn: null,
      rejectedById: admin.id,
      rejectedOn: new Date(),
      rejectionReason,
    });
  }
}
