import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import ApproveHoursEvent from '../events/volunteer-hours/approve-hours.event';
import RejectHoursEvent from '../events/volunteer-hours/reject-hours.event';
import { localized, PUSH_TITLE } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { NotificationMailerService } from '../services/notification-mailer.service';
import { UserType } from 'src/modules/user/enums/user.enum';
import { format } from 'date-fns';

@Injectable()
export class VolunteerHoursListener {
  constructor(
    private readonly notificationMailer: NotificationMailerService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.VOLUNTEER_HOURS.APPROVE)
  async sendApproveVolunteerHoursNotification(
    payload: ApproveHoursEvent,
  ): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      notificationsViaEmail,
      userEmail,
      organizationName,
      hours,
      date,
      activityLogId,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.VOLUNTEER_HOURS.APPROVE,
        payload: {
          id: organizationId,
          name: organizationName,
          activityLogId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          t.APPROVED_HOURS.PUSH.body(hours, format(date, 'dd/MM/yyy')),
        ),
        data: notificationData,
      });
    }

    // #593: the decision also goes by email, for a volunteer with push turned off
    if (notificationsViaEmail) {
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.APPROVED_HOURS.EMAIL.subject(organizationName),
          body: t.APPROVED_HOURS.EMAIL.body(hours, format(date, 'dd/MM/yyy')),
        }),
      );
    }
  }

  @OnEvent(EVENTS.VOLUNTEER_HOURS.REJECT)
  async sendRejectVolunteerHoursNotification(
    payload: RejectHoursEvent,
  ): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      notificationsViaEmail,
      userEmail,
      organizationName,
      hours,
      date,
      activityLogId,
      rejectionReason,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.VOLUNTEER_HOURS.REJECT,
        payload: {
          id: organizationId,
          name: organizationName,
          activityLogId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          t.REJECTED_HOURS.PUSH.body(hours, format(date, 'dd/MM/yyy')),
        ),
        data: notificationData,
      });
    }

    // #593: the decision also goes by email, with the reason
    if (notificationsViaEmail) {
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.REJECTED_HOURS.EMAIL.subject(organizationName),
          body: t.REJECTED_HOURS.EMAIL.body(
            hours,
            format(date, 'dd/MM/yyy'),
            rejectionReason,
          ),
        }),
      );
    }
  }
}
