import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { ExpoPushNotificationsService } from '../../../infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';
import { PushTokensRepository } from '../repositories/push-tokens.repository';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUES } from 'src/common/constants/constants';

@Injectable()
export class PushNotificationsService {
  expo = new Expo();

  constructor(
    @InjectQueue(QUEUES.PUSH_NOTIFICATIONS_TICKETS)
    private pushTicketsQueue: Queue<
      {
        token: string;
        ticket: ExpoPushTicket;
      }[]
    >,
    private readonly expoPushNotificationsService: ExpoPushNotificationsService,
    private readonly pushTokensRepository: PushTokensRepository,
  ) {
    setTimeout(() => {
      this.send(
        [
          'f6bf11b1-0524-4034-9f31-c5188ed4f348',
          '88fc8112-6697-4d76-bdec-324d29f9579c', //
        ],
        'Test',
        'Test',
      );
    }, 2000);
  }

  send = async (
    userIds: string[],
    title: string,
    body: string,
  ): Promise<ExpoPushTicket[]> => {
    // 1. Find all push tokens for the given user ids

    const tokens = await this.pushTokensRepository.findByUserIds(userIds);
    // 2. Send the notifications
    const tickets = await this.expoPushNotificationsService.send(
      tokens,
      title,
      body,
    );

    const tokenAndTickets: { ticket: ExpoPushTicket; token: string }[] =
      tickets.map((ticket, index) => ({
        ticket,
        token: tokens[index],
      }));

    // 3. Add the tickets in the queue to be checked after 30 minutes
    await this.pushTicketsQueue.add(tokenAndTickets, {
      delay: 1000 * 60 * 30,
    });

    // 4. Return the tickets
    return tickets;
  };
}
