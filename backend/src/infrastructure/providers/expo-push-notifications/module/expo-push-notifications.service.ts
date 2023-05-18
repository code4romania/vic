import { Inject, Injectable } from '@nestjs/common';
import {
  Expo,
  ExpoPushTicket,
  ExpoPushReceipt,
  ExpoPushErrorReceipt,
} from 'expo-server-sdk';
import { MODULE_OPTIONS_TOKEN } from './expo-push-notifications.module-definition';
import { ExpoPushNotificationsModuleOptions } from './expo-push-notifications.interfaces';

@Injectable()
export class ExpoPushNotificationsService {
  private expo: Expo;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private options: ExpoPushNotificationsModuleOptions,
  ) {
    this.expo = new Expo({ accessToken: this.options.accessToken });
  }

  send = async (
    tokens: string[],
    title: string,
    body: string,
  ): Promise<ExpoPushTicket[]> => {
    const messages = tokens.map((token) => {
      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        return null;
      }

      return {
        to: token,
        title,
        body,
        data: { withSome: 'data' },
      };
    });

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }

    return tickets;
  };

  getPushReceipts = async (
    receiptIds: string[],
  ): Promise<{ [id: string]: ExpoPushReceipt }> => {
    const receiptIdChunks =
      this.expo.chunkPushNotificationReceiptIds(receiptIds);
    let allReceipts = {};

    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(
          chunk,
        );
        allReceipts = { ...allReceipts, receipts };
      } catch (error) {
        console.error(error);
      }
    }

    return allReceipts;
  };
}
