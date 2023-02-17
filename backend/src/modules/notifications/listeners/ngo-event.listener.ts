import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/services/mail.service';
import { EVENTS } from '../constants/events.constants';
import AddNGOEventEvent from '../events/ngo-event/add-event.event';

@Injectable()
export class NGOEventListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(EVENTS.NGO_EVENT.ADD)
  async sendAddNGOEventNotification(payload: AddNGOEventEvent): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Retrieve event data
    // TODO: 4. Throw exception if event not found
    // TODO: 5. Send push notification to user

    // TODO: 6. Send mail to user with link to the event
    await this.mailService.sendEmail({
      to: 'user@test.com', //user email
      text: 'Approved',
      from: 'test@test.com',
      subject: 'Test approve request',
    });
  }
}
