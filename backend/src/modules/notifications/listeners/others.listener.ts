import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';
import { PushNotificationsFacade } from '../notifications.facade';
import { NOTIFICATIONS } from 'src/common/constants/notifications';

@Injectable()
export class OthersListener {
  private readonly logger = new Logger(OthersListener.name);
  constructor(
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendAnnouncementEvent(payload: SendAnnouncementEvent): Promise<void> {
    const { organizationId, organizationName, userIds, announcementId } =
      payload;

    const notificationData = {
      key: EVENTS.OTHER.SEND_ANNOUNCEMENT,
      payload: {
        organizationId,
        announcementId,
      },
    };

    this.pushNotificationsFacade.send({
      userIds: userIds,
      title: NOTIFICATIONS.NEW_ANNOUCEMENT.PUSH.title,
      body: NOTIFICATIONS.NEW_ANNOUCEMENT.PUSH.body(organizationName),
      data: notificationData,
    });
  }
}
