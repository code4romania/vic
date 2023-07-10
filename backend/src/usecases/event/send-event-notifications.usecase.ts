import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import AddNGOEventEvent from 'src/modules/notifications/events/ngo-event/add-event.event';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class SendEventNotificationsUsecase implements IUseCaseService<void> {
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    eventId: string,
    organizationId: string,
    organizationName: string,
    targetsIds?: string[],
  ): Promise<void> {
    // 6 send push notifications for all active users which are part of the organization or in case of department
    // 6.1. ALL ORGANIZATION
    //  Get all userIds from volunteer where organizationId

    // 6.2. Departments
    // Get all userIds from volunteer join volunteerProfile where volunteerProfile.departmentId in [...targets]
    const volunteers = await this.volunteerFacade.findAllActiveByDepartmentIds(
      organizationId,
      targetsIds,
    );

    // get al userIds for volunteers with push notifications settings set to on
    const userIdsForPushNotifications = volunteers
      .filter(
        (volunteer) =>
          volunteer.user.notificationsSettings.notificationsViaPush === true,
      )
      .map((volunteer) => volunteer.user.id);

    // get al emails for volunteers with email notifications settings set to on
    const userEmailForEmailNotifications = volunteers
      .filter(
        (volunteer) =>
          volunteer.user.notificationsSettings.notificationsViaEmail === true,
      )
      .map((volunteer) => volunteer.user.email);

    // send notifications
    this.eventEmitter.emit(
      EVENTS.NGO_EVENT.ADD,
      new AddNGOEventEvent(
        organizationId,
        userIdsForPushNotifications,
        organizationName,
        userEmailForEmailNotifications,
        eventId,
      ),
    );
  }
}
