import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import {
  IEventModel,
  UpdateEventOptions,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { GetOneEventUseCase } from './get-one-event.usecase';

@Injectable()
export class UpdateEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionsService: ExceptionsService,
  ) {}

  public async execute(
    id: string,
    data: UpdateEventOptions,
  ): Promise<IEventModel> {
    // 1. Find the event to update
    const event = await this.getOneEventUseCase.execute(id);

    // 2. Don't allow visibility changes if the status is PUBLISHED
    if (
      event.status !== EventStatus.DRAFT &&
      (data.isPublic !== undefined || data.targetsIds)
    ) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_004,
      );
    }
    // 3. Check if the tasks exists in the organization
    if (data.tasksIds?.length) {
      const tasksExists = await this.activityTypeFacade.exists(data.tasksIds, {
        organizationId: event.organization.id,
      });
      if (!tasksExists) {
        this.exceptionsService.badRequestException(
          EventExceptionMessages.EVENT_003,
        );
      }
    }
    // 4. Check if the target is correct
    if (data.targetsIds?.length) {
      const targetExists = await this.organizationStructureFacade.exists(
        data.targetsIds,
        {
          organizationId: event.organization.id,
          type: OrganizationStructureType.DEPARTMENT,
        },
      );
      if (!targetExists) {
        this.exceptionsService.badRequestException(
          EventExceptionMessages.EVENT_002,
        );
      }
    }

    // 5. For SIMPLE attandanceType there should be no attendanceMention
    if (data.attendanceType === EventAttendOptions.SIMPLE) {
      data.attendanceMention = undefined;
    }

    return this.eventFacade.update(id, data);
  }
}
