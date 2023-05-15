import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { ExpoPushNotificationsService } from '../../../infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';
import { UserFacadeService } from '../../user/services/user-facade.service';
import { PushTokensRepository } from '../repositories/push-tokens.repository';

@Injectable()
export class PushNotificationsService {
  expo = new Expo();

  constructor(
    private readonly expoPushNotificationsService: ExpoPushNotificationsService,
    private readonly pushTokensRepository: PushTokensRepository,
    private readonly usersService: UserFacadeService,
  ) {
    setTimeout(() => {
      this.send(['f6bf11b1-0524-4034-9f31-c5188ed4f348'], 'Test', 'Test');
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
    // 3. Add the tickets in the queue to be checked after 30 minutes

    // 4. Return the tickets
    return tickets;
  };
}
