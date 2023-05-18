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

type QueuePushTicketData = { ticket: ExpoPushTicket; token: string };

@Processor(QUEUES.PUSH_NOTIFICATIONS_TICKETS)
export class PushTicketsCheckerProcessor {
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
    } = {
      success: 0,
      errorTicketsHandled: [],
      errorReceiptsHandled: [],
      errorReceiptsUnhandled: [],
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
        await this.pushTokensRepository.delete({ token });
        result.errorTicketsHandled.push({ ticket, token });
      }
    }

    // ========================================================================
    // 2. Chech Push Receipts from FCM/APNS (Apple/Google)
    // ========================================================================
    const receipts = await this.expoPushNotificationsService.getPushReceipts(
      receiptIds,
    );

    // The receipts specify whether Apple or Google successfully received the
    // notification and information about an error, if one occurred.
    for (const receiptId in receipts) {
      const { status, details } = receipts[receiptId];
      if (status === 'ok') {
        result.success++;
        continue;
      } else if (status === 'error') {
        const message = (receipts[receiptId] as ExpoPushErrorReceipt).message;

        console.error(`There was an error sending a notification: ${message}`);

        if (details && details.error) {
          // The error codes are listed in the Expo documentation:
          // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
          // You must handle the errors appropriately.
          console.error(`The error code is ${details.error}`);
          if (details.error === 'DeviceNotRegistered') {
            await this.pushTokensRepository.delete({ token }); // TODO: need token here
            result.errorReceiptsHandled.push(
              receipts[receiptId] as ExpoPushErrorReceipt,
            ); //
          }
        }
      }
    }

    return result;
  }
}
