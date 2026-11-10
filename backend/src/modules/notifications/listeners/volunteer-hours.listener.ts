import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import ApproveHoursEvent from '../events/volunteer-hours/approve-hours.event';
import RejectHoursEvent from '../events/volunteer-hours/reject-hours.event';
import { NOTIFICATIONS } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { MailService } from 'src/modules/mail/services/mail.service';
import { format } from 'date-fns';

@Injectable()
export class VolunteerHoursListener {
  constructor(
    private readonly mailService: MailService,
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
        title: NOTIFICATIONS.APPROVED_HOURS.PUSH.title,
        body: NOTIFICATIONS.APPROVED_HOURS.PUSH.body(
          hours,
          format(date, 'dd/MM/yyy'),
        ),
        data: notificationData,
      });
    }

    // #593: the decision also goes by email, for a volunteer with push turned off
    if (notificationsViaEmail) {
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.APPROVED_HOURS.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.APPROVED_HOURS.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.APPROVED_HOURS.EMAIL.body(
            hours,
            format(date, 'dd/MM/yyy'),
          ),
        },
      });
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
        title: NOTIFICATIONS.REJECTED_HOURS.PUSH.title,
        body: NOTIFICATIONS.REJECTED_HOURS.PUSH.body(
          hours,
          format(date, 'dd/MM/yyy'),
        ),
        data: notificationData,
      });
    }

    // #593: the decision also goes by email, with the reason
    if (notificationsViaEmail) {
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.REJECTED_HOURS.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.REJECTED_HOURS.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.REJECTED_HOURS.EMAIL.body(
            hours,
            format(date, 'dd/MM/yyy'),
            rejectionReason,
          ),
        },
      });
    }
  }
}
