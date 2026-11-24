import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationMailerService } from '../services/notification-mailer.service';
import { UserType } from 'src/modules/user/enums/user.enum';
import { EVENTS } from '../constants/events.constants';
import ApproveRequestEvent from '../events/join-ngo/approve-request.event';
import ArchiveVolunteerEvent from '../events/join-ngo/archive-volunteer.event';
import RejectRequestEvent from '../events/join-ngo/reject-request.event';
import VolunteerLeftEvent from '../events/join-ngo/volunteer-left.event';
import { PushNotificationsFacade } from '../notifications.facade';
import { localized, PUSH_TITLE } from 'src/common/constants/notifications';

@Injectable()
export class JoinNGOListener {
  constructor(
    private readonly notificationMailer: NotificationMailerService,
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
        title: PUSH_TITLE,
        body: localized((t) =>
          t.APPROVE_ACCESS_REQUEST.PUSH.body(organizationName),
        ),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.APPROVE_ACCESS_REQUEST.EMAIL.subject(organizationName),
          body: t.APPROVE_ACCESS_REQUEST.EMAIL.body,
        }),
      );
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
      rejectionReason,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.JOIN_NGO.REJECT_REQUEST,
        payload: {
          organizationId,
          rejectionReason,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          t.REJECT_ACCESS_REQUEST.PUSH.body(organizationName, rejectionReason),
        ),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.REJECT_ACCESS_REQUEST.EMAIL.subject(organizationName),
          body: t.REJECT_ACCESS_REQUEST.EMAIL.body(rejectionReason),
        }),
      );
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
        title: PUSH_TITLE,
        body: localized((t) => t.ARCHIVE_VOLUNTEER.PUSH.body(organizationName)),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.ARCHIVE_VOLUNTEER.EMAIL.subject(organizationName),
          body: t.ARCHIVE_VOLUNTEER.EMAIL.body,
        }),
      );
    }
  }

  // #593: the organization's admins learn that a volunteer left
  @OnEvent(EVENTS.JOIN_NGO.VOLUNTEER_LEFT)
  async sendVolunteerLeftNotification(
    payload: VolunteerLeftEvent,
  ): Promise<void> {
    const { organizationName, userEmails, volunteerName } = payload;

    // one email per admin, so they do not see each other's address; each in the admin's own language
    await this.notificationMailer.send(userEmails, UserType.ADMIN, (t) => ({
      subject: t.VOLUNTEER_LEFT.EMAIL.subject(volunteerName),
      body: t.VOLUNTEER_LEFT.EMAIL.body(volunteerName, organizationName),
    }));
  }
}
