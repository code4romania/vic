import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import SendAnnouncementEvent from '../events/others/send-announcement.event';

@Injectable()
export class OthersListener {
  @OnEvent(EVENTS.OTHER.SEND_ANNOUNCEMENT)
  async sendSendAnnouncementEvent(
    payload: SendAnnouncementEvent,
  ): Promise<void> {
    console.log(payload);
    // TODO: 1. Retrieve the organization data
    // TODO: 2. Throw exception if organization not found
    // TODO: 3. Retrive the announcement data
    // TODO: 4. Throw exception if announcement not found
    // TODO: 5. Retrieve the target data
    // TODO: 6. Throw exception if target not found
    // TODO: 7. Send push notification to target with announcement link
  }
}
