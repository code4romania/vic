import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';

@Injectable()
export class ActivateActivityTypeUseCase
  implements IUseCaseService<IActivityTypeModel>
{
  constructor(
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(id: string): Promise<IActivityTypeModel> {
    const toUpdate = await this.activityTypeFacade.find({ id });

    if (!toUpdate) {
      this.exceptionService.notFoundException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
      );
    }

    if (toUpdate.status == ActivityTypeStatus.ACTIVE) {
      this.exceptionService.badRequestException(
        ActivityTypeExceptionMessages.ACTIVITY_TYPE_003,
      );
    }

    return this.activityTypeFacade.activate(id);
  }
}
