import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';

@Injectable()
export class CancelActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly activityLogFacade: ActivityLogFacade,
  ) {}

  public async execute(id: string): Promise<void> {
    // 1. Check if the log to be delete, exists
    const log = await this.getOneActivityLogUsecase.execute(id);

    if (log.status !== ActivityLogStatus.PENDING) {
      this.exceptionService.badRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_004,
      );
    }

    await this.activityLogFacade.delete(id);
  }
}
