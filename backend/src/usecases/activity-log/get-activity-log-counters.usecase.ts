import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IActivityLogCountByStatus } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetActivityLogCountersUsecase
  implements IUseCaseService<IActivityLogCountByStatus>
{
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public execute(organizationId: string): Promise<IActivityLogCountByStatus> {
    return this.activityLogFacade.count(organizationId);
  }
}
