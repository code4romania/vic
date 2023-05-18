import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES } from 'src/common/constants/constants';
import {
  ExpoPushTicket,
  ExpoPushSuccessTicket,
  ExpoPushErrorReceipt,
} from 'expo-server-sdk';
import { ExpoPushNotificationsService } from 'src/infrastructure/providers/expo-push-notifications/module/expo-push-notifications.service';
import { PushTokensRepository } from '../repositories/push-tokens.repository';
import { Logger } from '@nestjs/common';

type QueuePushTicketData = { ticket: ExpoPushTicket; token: string };

@Processor(QUEUES.PUSH_NOTIFICATIONS_TICKETS)
export class PushTicketsCheckerProcessor {
  private readonly logger = new Logger(PushTicketsCheckerProcessor.name);

  constructor(
    private readonly expoPushNotificationsService: ExpoPushNotificationsService,
    private readonly pushTokensRepository: PushTokensRepository,
  ) {}

  @Process()
  public async processor(job: Job<QueuePushTicketData[]>): Promise<unknown> {
    const result: {
      success: number;
      errorTicketsHandled: QueuePushTicketData[];
      errorReceiptsHandled: ExpoPushErrorReceipt[];
      errorReceiptsUnhandled: ExpoPushErrorReceipt[];
      otherErrors: unknown[];
    } = {
      success: 0,
      errorTicketsHandled: [],
      errorReceiptsHandled: [],
      errorReceiptsUnhandled: [],
      otherErrors: [],
    };

    const ticketsToBeChecked: { ticketId: string; token: string }[] = [];

    // ========================================================================
    // 1. Check Push Tickets from Expo
    // ========================================================================
    for (const { ticket, token } of job.data) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if ((ticket as ExpoPushSuccessTicket)?.id) {
        // Save ticket id and token to be correlated with the receipt
        ticketsToBeChecked.push({
          ticketId: (ticket as ExpoPushSuccessTicket).id,
          token,
        });
      } else {
        // Remove the token from the database
        try {
          await this.pushTokensRepository.delete({ token });
          result.errorTicketsHandled.push({ ticket, token });
        } catch (err) {
          result.otherErrors.push({ err, ticket, token });
        }
      }
    }

    // ========================================================================
    // 2. Chech Push Receipts from FCM/APNS (Apple/Google)
    // ========================================================================
    let receipts = null;

    // Get receipts from Expo, stop in case of error
    try {
      receipts = await this.expoPushNotificationsService.getPushReceipts(
        ticketsToBeChecked.map(({ ticketId }) => ticketId),
      );
    } catch (err) {
      result.otherErrors.push({ err });
      return result;
    }

    // The receipts specify whether Apple or Google successfully received the
    // notification and information about an error, if one occurred.
    for (const receiptId in receipts) {
      const { status, details } = receipts[receiptId];
      if (status === 'ok') {
        result.success++;
        continue;
      } else if (status === 'error') {
        this.logger.error(
          `There was an error sending a notification: ${
            (receipts[receiptId] as ExpoPushErrorReceipt).message
          }`,
        );

        if (details && details.error) {
          // You must handle the errors appropriately.
          this.logger.error(`The error code is ${details.error}`);
          /**
           * The error codes are listed in the Expo documentation: https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
           * 1. DeviceNotRegistered: The device cannot receive push notifications anymore and you should stop sending messages to the corresponding Expo push token.
           * 2. MessageTooBig: The total notification payload was too large. On Android and iOS, the total payload must be at most 4096 bytes.
           * 3. MessageRateExceeded: You are sending messages too frequently to the given device. Implement exponential backoff and slowly retry sending messages.
           * 4. MismatchSenderId: This indicates that there is an issue with your FCM push credentials. There are two pieces to FCM push credentials: your FCM server key, and your google-services.json file. Both must be associated with the same sender ID. You can find your sender ID in the same place you find your server key. Check that the server key from your project's Expo dashboard under Credentials > Application Identifier > FCM Server Key and that the sender ID from your project's google-services.json > project_number is the same as shown in the Firebase console under Project Settings > Cloud Messaging tab > Cloud Messaging API (Legacy).
           * 5. InvalidCredentials: Your push notification credentials for your standalone app are invalid (for example, you may have revoked them).
                  Android: Make sure that you have correctly uploaded the server key from the Firebase Console as specified in uploading FCM server credentials.
                  iOS: Run eas credentials and follow the prompts to regenerate new push notification credentials. If you revoke an APN key, all apps that rely on that key will no longer be able to send or receive push notifications until you upload a new key to replace it. Uploading a new APN key will not change your users' Expo Push Tokens. Sometimes, these errors will contain further details claiming an InvalidProviderToken error. This is actually tied to both your APN key and your provisioning profile. To resolve this error, you should rebuild the app and regenerate a new push key and provisioning profile.
           */
          if (details.error === 'DeviceNotRegistered') {
            // Find the token by the receiptId (correlated ticketId with receiptId)
            const tokenToDelete = ticketsToBeChecked.find(
              ({ ticketId }) => ticketId === receiptId,
            );
            try {
              // Remove the token from the database
              await this.pushTokensRepository.delete({
                token: tokenToDelete.token,
              });
              // Add the receipt to the handled receipts
              result.errorReceiptsHandled.push(
                receipts[receiptId] as ExpoPushErrorReceipt,
              );
            } catch (err) {
              result.otherErrors.push({
                err,
                receipt: receipts[receiptId],
                token: tokenToDelete.token,
              });
            }
          } else {
            // Add the receipt to the unhandled receipts
            result.errorReceiptsUnhandled.push(
              receipts[receiptId] as ExpoPushErrorReceipt,
            );
          }
        }
      }
    }

    return result;
  }
}
