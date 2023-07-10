import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/services/mail.service';
import { EVENTS } from '../constants/events.constants';
import AddNGOEventEvent from '../events/ngo-event/add-event.event';
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
}
