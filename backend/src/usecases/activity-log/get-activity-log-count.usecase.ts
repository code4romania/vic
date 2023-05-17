import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { FindActivityLogCountOptions } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetActivityLogCountUsecase implements IUseCaseService<number> {
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public execute(findOptions: FindActivityLogCountOptions): Promise<number> {
    return this.activityLogFacade.countActivityLogs(findOptions);
  }
}
