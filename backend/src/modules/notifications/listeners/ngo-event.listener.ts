import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationMailerService } from '../services/notification-mailer.service';
import { UserType } from 'src/modules/user/enums/user.enum';
import { EVENTS } from '../constants/events.constants';
import AddNGOEventEvent from '../events/ngo-event/add-event.event';
import VolunteerAddedToEventEvent from '../events/ngo-event/volunteer-added.event';
import RegistrationDecidedEvent from '../events/ngo-event/registration-decided.event';
import { PushNotificationsFacade } from '../notifications.facade';
import { localized, PUSH_TITLE } from 'src/common/constants/notifications';

@Injectable()
export class NGOEventListener {
  constructor(
    private readonly notificationMailer: NotificationMailerService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.NGO_EVENT.ADD)
  async sendAddNGOEventNotification(payload: AddNGOEventEvent): Promise<void> {
    const { organizationId, organizationName, eventId, userIds, userEmails } =
      payload;

    const notificationData = {
      key: EVENTS.NGO_EVENT.ADD,
      payload: {
        organizationId,
        eventId,
      },
    };

    this.pushNotificationsFacade.send({
      userIds: userIds,
      title: PUSH_TITLE,
      body: localized((t) => t.NEW_EVENT.PUSH.body(organizationName)),
      data: notificationData,
    });

    // one email per volunteer, each in their own language
    await this.notificationMailer.send(userEmails, UserType.REGULAR, (t) => ({
      subject: t.NEW_EVENT.EMAIL.subject(organizationName),
      body: t.NEW_EVENT.EMAIL.body,
    }));
  }

  // #496
  @OnEvent(EVENTS.NGO_EVENT.VOLUNTEER_ADDED)
  async sendVolunteerAddedNotification(
    payload: VolunteerAddedToEventEvent,
  ): Promise<void> {
    const {
      organizationId,
      organizationName,
      eventId,
      eventName,
      userIds,
      userEmails,
    } = payload;

    // userIds and userEmails hold only the people who turned that channel on
    if (userIds.length) {
      this.pushNotificationsFacade.send({
        userIds,
        title: PUSH_TITLE,
        body: localized((t) =>
          t.ADDED_TO_EVENT.PUSH.body(organizationName, eventName),
        ),
        data: {
          key: EVENTS.NGO_EVENT.VOLUNTEER_ADDED,
          payload: { organizationId, eventId },
        },
      });
    }

    await this.notificationMailer.send(userEmails, UserType.REGULAR, (t) => ({
      subject: t.ADDED_TO_EVENT.EMAIL.subject(organizationName, eventName),
      body: t.ADDED_TO_EVENT.EMAIL.body,
    }));
  }

  // #501
  @OnEvent(EVENTS.NGO_EVENT.REGISTRATION_APPROVED)
  async sendRegistrationApprovedNotification(
    payload: RegistrationDecidedEvent,
  ): Promise<void> {
    await this.sendRegistrationDecision(
      payload,
      EVENTS.NGO_EVENT.REGISTRATION_APPROVED,
    );
  }

  @OnEvent(EVENTS.NGO_EVENT.REGISTRATION_REJECTED)
  async sendRegistrationRejectedNotification(
    payload: RegistrationDecidedEvent,
  ): Promise<void> {
    await this.sendRegistrationDecision(
      payload,
      EVENTS.NGO_EVENT.REGISTRATION_REJECTED,
    );
  }

  private async sendRegistrationDecision(
    payload: RegistrationDecidedEvent,
    key: string,
  ): Promise<void> {
    const {
      organizationId,
      organizationName,
      eventId,
      eventName,
      userId,
      userEmail,
      reason,
      notificationsViaPush,
      notificationsViaEmail,
    } = payload;
    const approved = key === EVENTS.NGO_EVENT.REGISTRATION_APPROVED;

    if (notificationsViaPush) {
      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          (approved
            ? t.REGISTRATION_APPROVED
            : t.REGISTRATION_REJECTED
          ).PUSH.body(organizationName, eventName),
        ),
        data: { key, payload: { organizationId, eventId } },
      });
    }

    if (notificationsViaEmail && userEmail) {
      await this.notificationMailer.send([userEmail], UserType.REGULAR, (t) =>
        approved
          ? {
              subject: t.REGISTRATION_APPROVED.EMAIL.subject(
                organizationName,
                eventName,
              ),
              body: t.REGISTRATION_APPROVED.EMAIL.body,
            }
          : {
              subject: t.REGISTRATION_REJECTED.EMAIL.subject(
                organizationName,
                eventName,
              ),
              body: t.REGISTRATION_REJECTED.EMAIL.body(reason),
            },
      );
    }
  }
}
