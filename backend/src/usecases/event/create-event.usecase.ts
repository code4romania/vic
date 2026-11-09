import { Injectable } from '@nestjs/common';
import { OrganizationGateService } from '../organization/organization-gate.service';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
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
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import AddNGOEventEvent from 'src/modules/notifications/events/ngo-event/add-event.event';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';

// VIC 2.0 (#492): no banner, linked activities, internal notes or registration type;
// the target is "public", "all departments" or a list of departments; capacity is new.
@Injectable()
export class CreateEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly organizationGate: OrganizationGateService,
    private readonly eventFacade: EventFacade,
    private readonly getOrganizationUseCaseService: GetOrganizationUseCaseService,
    private readonly organizationStructureFacade: OrganizationStructureFacade,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getVolunteerUserDataForNotificationsUsecase: GetVolunteersUserDataForNotificationsUsecase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    data: CreateEventOptions,
    admin: IAdminUserModel,
  ): Promise<IEventModel> {
    // 0. An NGO that is not validated (or is suspended) cannot be joined, run events or log hours (decision 1)
    await this.organizationGate.assertValidated(data.organizationId);

    // 1. Check if the the organization exists
    const organization = await this.getOrganizationUseCaseService.execute(
      data.organizationId,
    );

    // 2. Check event visiblity and target
    // - Public events are not targeted to any department within the organization and can be joined by anyone
    // - Not public events, can be available to the entire organization if no target is specified
    if (data.isPublic) {
      // 2.1. For public events, target must be null
      data.targetsIds = undefined;
    } else if (data.targetsIds?.length) {
      // 2.2. Check if target is correct
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

    // 3. Save the event
    const created = await this.eventFacade.create(data);

    if (created.status === EventStatus.PUBLISHED) {
      // send push notifications
      const { userEmails, userIds } =
        await this.getVolunteerUserDataForNotificationsUsecase.execute(
          organization.id,
          data.targetsIds,
        );

      // send notifications
      this.eventEmitter.emit(
        EVENTS.NGO_EVENT.ADD,
        new AddNGOEventEvent(
          organization.id,
          userIds,
          organization.name,
          userEmails,
          created.id,
        ),
      );
    }

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
