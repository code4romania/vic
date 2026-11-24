import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { ExpoPushNotificationsService } from '../../../infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';
import { PushTokensRepository } from '../repositories/push-tokens.repository';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUES } from 'src/common/constants/constants';
import {
  PushText,
  SendNotificationData,
} from '../models/send-notification-data.model';
import { DEFAULT_LANGUAGE, Language } from 'src/modules/user/enums/user.enum';

const textIn = (text: PushText, language: Language): string =>
  typeof text === 'string' ? text : text[language] ?? text[DEFAULT_LANGUAGE];

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
  ) {}

  send = async ({
    userIds,
    title,
    body,
    data,
  }: SendNotificationData): Promise<void> => {
    // 1. Find all push tokens for the given user ids, with each user's language
    const devices =
      await this.pushTokensRepository.findByUserIdsWithLanguage(userIds);

    // 2. Send the notifications: one batch per language, each phone in the language of its user
    // (Romanian for a user who has not chosen one)
    const tokenAndTickets: { ticket: ExpoPushTicket; token: string }[] = [];
    for (const language of Object.values(Language)) {
      const tokens = devices
        .filter((device) => (device.language ?? DEFAULT_LANGUAGE) === language)
        .map((device) => device.token);
      if (!tokens.length) continue;

      const tickets = await this.expoPushNotificationsService.send(
        tokens,
        textIn(title, language),
        textIn(body, language),
        data,
      );
      tickets.forEach((ticket, index) =>
        tokenAndTickets.push({ ticket, token: tokens[index] }),
      );
    }

    // 3. Add the tickets in the queue to be checked after 30 minutes
    await this.pushTicketsQueue.add(tokenAndTickets, {
      delay: 1000 * 60 * 30,
    });

    return;
  };
}
