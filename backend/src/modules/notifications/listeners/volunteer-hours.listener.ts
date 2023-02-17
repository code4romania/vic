import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import ApproveHoursEvent from '../events/volunteer-hours/approve-hours.event';
import RejectHoursEvent from '../events/volunteer-hours/reject-hours.event';

@Injectable()
export class VolunteerHoursListener {
  @OnEvent(EVENTS.VOLUNTEER_HOURS.APPROVE)
  async sendApproveVolunteerHoursNotification(
    payload: ApproveHoursEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Retrive the activity log data
    // TODO: 4. Throw exception if activity log not found
    // TODO: 5. Send push notification to user with approval message
  }

  @OnEvent(EVENTS.VOLUNTEER_HOURS.REJECT)
  async sendRejectVolunteerHoursNotification(
    payload: RejectHoursEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Retrive the activity log data
    // TODO: 4. Throw exception if activity log not found
    // TODO: 5. Send push notification to user with rejection message
  }
}
