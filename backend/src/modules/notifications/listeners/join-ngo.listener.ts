import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/services/mail.service';
import { EVENTS } from '../constants/events.constants';
import ApproveRequestEvent from '../events/join-ngo/approve-request.event';
import ArchiveVolunteerEvent from '../events/join-ngo/archive-volunteer.event';
import RejectRequestEvent from '../events/join-ngo/reject-request.event';
import { PushNotificationsFacade } from '../notifications.facade';
import { NOTIFICATIONS } from 'src/common/constants/notifications';

@Injectable()
export class JoinNGOListener {
  constructor(
    private readonly mailService: MailService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.JOIN_NGO.APPROVE_REQUEST)
  async sendJoinNGOApproveRequestNotification(
    payload: ApproveRequestEvent,
  ): Promise<void> {
    const {
      volunteerId,
      userId,
      organizationId,
      notificationsViaEmail,
      notificationsViaPush,
      userEmail,
      organizationName,
      logo,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.JOIN_NGO.APPROVE_REQUEST,
        payload: {
          id: organizationId,
          name: organizationName,
          logo: logo,
          volunteerId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.APPROVE_ACCESS_REQUEST.PUSH.title,
        body: NOTIFICATIONS.APPROVE_ACCESS_REQUEST.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject:
          NOTIFICATIONS.APPROVE_ACCESS_REQUEST.EMAIL.subject(organizationName),
        context: {
          title:
            NOTIFICATIONS.APPROVE_ACCESS_REQUEST.EMAIL.subject(
              organizationName,
            ),
          subtitle: NOTIFICATIONS.APPROVE_ACCESS_REQUEST.EMAIL.body,
        },
      });
    }
  }

  @OnEvent(EVENTS.JOIN_NGO.REJECT_REQUEST)
  async sendJoinNGORejectRequestNotification(
    payload: RejectRequestEvent,
  ): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaEmail,
      notificationsViaPush,
      userEmail,
      organizationName,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.JOIN_NGO.REJECT_REQUEST,
        payload: {
          id: organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.REJECT_ACCESS_REQUEST.PUSH.title,
        body: NOTIFICATIONS.REJECT_ACCESS_REQUEST.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject:
          NOTIFICATIONS.REJECT_ACCESS_REQUEST.EMAIL.subject(organizationName),
        context: {
          title:
            NOTIFICATIONS.REJECT_ACCESS_REQUEST.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.REJECT_ACCESS_REQUEST.EMAIL.body,
        },
      });
    }
  }

  @OnEvent(EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER)
  async sendJoinNGOArchiveVolunteerNotification(
    payload: ArchiveVolunteerEvent,
  ): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaEmail,
      notificationsViaPush,
      userEmail,
      organizationName,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER,
        payload: {
          id: organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.ARCHIVE_VOLUNTEER.PUSH.title,
        body: NOTIFICATIONS.ARCHIVE_VOLUNTEER.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject:
          NOTIFICATIONS.ARCHIVE_VOLUNTEER.EMAIL.subject(organizationName),
        context: {
          title:
            NOTIFICATIONS.ARCHIVE_VOLUNTEER.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.ARCHIVE_VOLUNTEER.EMAIL.body,
        },
      });
    }
  }
}
