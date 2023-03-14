import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindManyActivityTypeOptions,
  IActivityTypeModel,
} from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';

@Injectable()
export class GetManyActivityTypeUseCase
  implements IUseCaseService<IActivityTypeModel[]>
{
  constructor(private readonly activityTypeFacade: ActivityTypeFacade) {}

  public async execute(
    options: FindManyActivityTypeOptions,
  ): Promise<IActivityTypeModel[]> {
    return this.activityTypeFacade.findAll(options);
  }
}
