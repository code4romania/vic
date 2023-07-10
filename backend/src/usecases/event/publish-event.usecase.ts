import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventExceptionMessages } from 'src/modules/event/exceptions/event.exceptions';
import { IEventModel } from 'src/modules/event/models/event.model';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOneEventUseCase } from './get-one-event.usecase';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetVolunteersUserDataForNotificationsUsecase } from '../volunteer/get-volunteers-user-data-for-notifications.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import AddNGOEventEvent from 'src/modules/notifications/events/ngo-event/add-event.event';

@Injectable()
export class PublishEventUseCase implements IUseCaseService<IEventModel> {
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
    private readonly exceptionsService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly getOrganizationUsecase: GetOrganizationUseCaseService,
    private readonly getVolunteerUserDataForNotificationsUsecase: GetVolunteersUserDataForNotificationsUsecase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    id: string,
    admin: IAdminUserModel,
  ): Promise<IEventModel> {
    const organization = await this.getOrganizationUsecase.execute(
      admin.organizationId,
    );

    // 1. Find the event to publish
    const event = await this.getOneEventUseCase.execute({ id });

    // 2. Can't publish an already published event
    if (event.status === EventStatus.PUBLISHED) {
      this.exceptionsService.badRequestException(
        EventExceptionMessages.EVENT_005,
      );
    }

    const updated = await this.eventFacade.publish(id);

    // send push notifications
    const { userEmails, userIds } =
      await this.getVolunteerUserDataForNotificationsUsecase.execute(
        organization.id,
        event.targets?.map((target) => target.id),
      );

    // send notifications
    this.eventEmitter.emit(
      EVENTS.NGO_EVENT.ADD,
      new AddNGOEventEvent(
        organization.id,
        userIds,
        organization.name,
        userEmails,
        event.id,
      ),
    );

    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_EVENT_STATUS,
      {
        eventId: updated.id,
        eventName: updated.name,
        oldStatus: event.status,
        newStatus: updated.status,
      },
      admin,
    );

    return updated;
  }
}
