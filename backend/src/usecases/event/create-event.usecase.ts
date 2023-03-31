import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityTypeFacade } from 'src/modules/activity-type/services/activity-type.facade';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import {
  CreateEventOptions,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { OrganizationStructureFacade } from 'src/modules/organization/services/organization-structure.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';

@Injectable()
export class CreateEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOrganizationUseCaseService: GetOrganizationUseCaseService,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly activityTypeFacade: ActivityTypeFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
  ) {}

  public async execute(
    data: CreateEventOptions,
    admin: IAdminUserModel,
  ): Promise<IEventModel> {
    // 1. Check if the the organization exists
    await this.getOrganizationUseCaseService.execute(data.organizationId);

    // 2. Check if the tasks exists in the organization
    const tasksExists = await this.activityTypeFacade.exists(data.tasksIds, {
      organizationId: data.organizationId,
    });
    if (!tasksExists) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_003,
      );
    }
    // 3. Check event visiblity and target=
    // - Public events are not targeted to any department within the organization and can be joined by anyone
    // - Not public events, can be available to the entire organization if no target is specified

    // 3.1. For public events, target must be null
    if (data.isPublic) {
      data.targetsIds = undefined;
    } else if (data.targetsIds?.length) {
      // 3.2. Check if target is correct
      const targetExists = await this.organizationStructureFacade.exists(
        data.targetsIds,
        {
          organizationId: data.organizationId,
          type: OrganizationStructureType.DEPARTMENT,
        },
      );
      if (!targetExists) {
        this.exceptionsService.badRequestException(
          EventExceptionMessages.EVENT_002,
        );
      }
    }
    // 4. For SIMPLE attandanceType there should be no attendanceMention
    if (data.attendanceType === EventAttendOptions.SIMPLE) {
      data.attendanceMention = undefined;
    }

    const created = await this.eventFacade.create(data);

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CREATE_EVENT,
      {
        eventId: created.id,
        eventName: created.name,
        status: created.status,
      },
      admin,
    );

    return created;
  }
}
