import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { ActivityLogExceptionMessages } from 'src/modules/activity-log/exceptions/activity-log.exceptions';
import {
  IActivityLogModel,
  UpdateActivityLogOptions,
} from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogFacade } from 'src/modules/activity-log/services/activity-log.facade';
import { ActivityTypeExceptionMessages } from 'src/modules/activity-type/exceptions/activity-type.exceptions';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { GetOneEventUseCase } from '../event/get-one-event.usecase';
import { GetOneActivityLogUsecase } from './get-one-activity-log.usecase';

@Injectable()
export class UpdateActivityLogUsecase
  implements IUseCaseService<IActivityLogModel>
{
  constructor(
    private readonly activityLogFacade: ActivityLogFacade,
    private readonly getOneActivityLogUsecase: GetOneActivityLogUsecase,
    private readonly getOneEventUsecase: GetOneEventUseCase,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    id: string,
    updates: UpdateActivityLogOptions,
  ): Promise<IActivityLogModel> {
    // 1. Check if the log to be updated, exists
    const log = await this.getOneActivityLogUsecase.execute(id);

    // 2. Allow updates only for PENDING requests
    if (log.status !== ActivityLogStatus.PENDING) {
      this.exceptionService.badRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_003,
      );
    }

    // 3. Check if the updated event exists in the organization and is different
    if (updates.eventId && log.event?.id !== updates.eventId) {
      await this.getOneEventUsecase.execute({
        id: updates.eventId,
        organizationId: log.event.organization.id,
      });
    }
    // 4. Check if the task exists in the organization
    if (updates.activityTypeId) {
      const taskExists = await this.activityTypeFacade.exists(
        [updates.activityTypeId],
        { organizationId: log.event.organization.id },
      );
      if (!taskExists) {
        this.exceptionService.badRequestException(
          ActivityTypeExceptionMessages.ACTIVITY_TYPE_001,
        );
      }
    }

    return this.activityLogFacade.update(id, {
      ...updates,
      activityTypeId: (updates.activityTypeId || null) as never,
    });
  }
}
