import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import ApproveHoursEvent from '../events/volunteer-hours/approve-hours.event';
import RejectHoursEvent from '../events/volunteer-hours/reject-hours.event';
import { NOTIFICATIONS } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { format } from 'date-fns';

@Injectable()
export class VolunteerHoursListener {
  constructor(
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
  }

  @OnEvent(EVENTS.VOLUNTEER_HOURS.REJECT)
  async sendRejectVolunteerHoursNotification(
    payload: RejectHoursEvent,
  ): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      hours,
      date,
      activityLogId,
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
  }
}
