import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/services/mail.service';
import { EVENTS } from '../constants/events.constants';
import ApproveRequestEvent from '../events/join-ngo/approve-request.event';
import ArchiveVolunteerEvent from '../events/join-ngo/archive-volunteer.event';
import RejectRequestEvent from '../events/join-ngo/reject-request.event';

@Injectable()
export class JoinNGOListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(EVENTS.JOIN_NGO.APPROVE_REQUEST)
  async sendJoinNGOApproveRequestNotification(
    payload: ApproveRequestEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Send push notification to user

    // TODO: 4. Send mail to user with link to the volunteer profile for the organization
    await this.mailService.sendEmail({
      to: 'user@test.com', //user email
      text: 'Approved',
      from: 'test@test.com',
      subject: 'Test approve request',
    });
  }

  @OnEvent(EVENTS.JOIN_NGO.REJECT_REQUEST)
  async sendJoinNGORejectRequestNotification(
    payload: RejectRequestEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Send push notification to user

    // TODO: 4. Send mail to user with link to the organization
    await this.mailService.sendEmail({
      to: 'user@test.com', // user email
      text: 'Rejected',
      from: 'test@test.com',
      subject: 'Test reject request',
    });
  }

  @OnEvent(EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER)
  async sendJoinNGOArchiveVolunteerNotification(
    payload: ArchiveVolunteerEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Send push notification to user

    // TODO: 4. Send mail to ?
    await this.mailService.sendEmail({
      to: 'test@test.com',
      text: 'Archived',
      from: 'test@test.com',
      subject: 'Test archive volunteer',
    });
  }
}
