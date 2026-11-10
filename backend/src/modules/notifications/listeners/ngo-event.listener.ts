import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/services/mail.service';
import { EVENTS } from '../constants/events.constants';
import AddNGOEventEvent from '../events/ngo-event/add-event.event';
import VolunteerAddedToEventEvent from '../events/ngo-event/volunteer-added.event';
import RegistrationDecidedEvent from '../events/ngo-event/registration-decided.event';
import { PushNotificationsFacade } from '../notifications.facade';
import { NOTIFICATIONS } from 'src/common/constants/notifications';

@Injectable()
export class NGOEventListener {
  constructor(
    private readonly mailService: MailService,
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
      title: NOTIFICATIONS.NEW_EVENT.PUSH.title,
      body: NOTIFICATIONS.NEW_EVENT.PUSH.body(organizationName),
      data: notificationData,
    });

    // add each email in a queue
    userEmails.forEach(
      async (email: string) =>
        await this.mailService.sendEmail({
          to: email,
          subject: NOTIFICATIONS.NEW_EVENT.EMAIL.subject(organizationName),
          context: {
            title: NOTIFICATIONS.NEW_EVENT.EMAIL.subject(organizationName),
            subtitle: NOTIFICATIONS.NEW_EVENT.EMAIL.body,
          },
        }),
    );
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
        title: NOTIFICATIONS.ADDED_TO_EVENT.PUSH.title,
        body: NOTIFICATIONS.ADDED_TO_EVENT.PUSH.body(
          organizationName,
          eventName,
        ),
        data: {
          key: EVENTS.NGO_EVENT.VOLUNTEER_ADDED,
          payload: { organizationId, eventId },
        },
      });
    }

    const subject = NOTIFICATIONS.ADDED_TO_EVENT.EMAIL.subject(
      organizationName,
      eventName,
    );
    userEmails.forEach(
      async (email: string) =>
        await this.mailService.sendEmail({
          to: email,
          subject,
          context: {
            title: subject,
            subtitle: NOTIFICATIONS.ADDED_TO_EVENT.EMAIL.body,
          },
        }),
    );
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
    const texts = approved
      ? NOTIFICATIONS.REGISTRATION_APPROVED
      : NOTIFICATIONS.REGISTRATION_REJECTED;

    if (notificationsViaPush) {
      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: texts.PUSH.title,
        body: texts.PUSH.body(organizationName, eventName),
        data: { key, payload: { organizationId, eventId } },
      });
    }

    if (notificationsViaEmail && userEmail) {
      const subject = texts.EMAIL.subject(organizationName, eventName);
      await this.mailService.sendEmail({
        to: userEmail,
        subject,
        context: {
          title: subject,
          subtitle: approved
            ? NOTIFICATIONS.REGISTRATION_APPROVED.EMAIL.body
            : NOTIFICATIONS.REGISTRATION_REJECTED.EMAIL.body(reason),
        },
      });
    }
  }
}
