import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetOneActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IActivityLogModel> {
    const log = await this.activityLogFacade.find(id);

    if (!log) {
      this.exceptionService.notFoundException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_001,
      );
    }

    return log;
  }
}
