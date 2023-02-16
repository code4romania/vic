import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import SendAccouncementEvent from '../events/others/send-accouncement.event';

@Injectable()
export class OthersListener {
  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendSendAccouncementEvent(
    payload: SendAccouncementEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the user data
    // TODO: 2. Throw exception if user not found
    // TODO: 3. Retrive the accouncement data
    // TODO: 4. Throw exception if accouncement not found
    // TODO: 5. Send push notification to user with annoucement link
  }
}
