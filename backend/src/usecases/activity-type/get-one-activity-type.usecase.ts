import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';

@Injectable()
export class GetOneActivityTypeUseCase
  implements IUseCaseService<IActivityTypeModel>
{
  constructor(
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IActivityTypeModel> {
    const activityType = await this.activityTypeFacade.find({ id });

    if (!activityType) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
      );
    }

    return activityType;
  }
}
