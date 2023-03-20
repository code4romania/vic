import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyActivityLogsOptions,
  IActivityLogListItemModel,
} from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';

@Injectable()
export class GetManyActivityLogsUsecase
  implements IUseCaseService<Pagination<IActivityLogListItemModel>>
{
  constructor(private readonly activityLogFacade: ActivityLogFacade) {}

  public execute(
    findOptions: FindManyActivityLogsOptions,
  ): Promise<Pagination<IActivityLogListItemModel>> {
    return this.activityLogFacade.findMany(findOptions);
  }
}
