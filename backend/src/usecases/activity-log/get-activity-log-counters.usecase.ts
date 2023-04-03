import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindManyActivityLogCounterOptions,
  IActivityLogCountHoursByStatus,
} from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetActivityLogCountersUsecase
  implements IUseCaseService<IActivityLogCountHoursByStatus>
{
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public execute(
    findManyOptions: FindManyActivityLogCounterOptions,
  ): Promise<IActivityLogCountHoursByStatus> {
    return this.activityLogFacade.countHoursByStatus(findManyOptions);
  }
}
