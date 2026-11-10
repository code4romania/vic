import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { NotificationsExceptionMessages } from 'src/modules/notifications/exceptions/notifications.exceptions';
import { IPushTokenModel } from 'src/modules/notifications/models/push-token.model';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';

@Injectable()
export class UnregisterDevicePushTokenUseCase
  implements IUseCaseService<IPushTokenModel>
{
  private readonly logger = new Logger(UnregisterDevicePushTokenUseCase.name);

  constructor(
    private readonly pushNotificationService: PushNotificationsFacade,
    private readonly exceptionService: ExceptionsService,
  ) {}

  // Removes the device token of this user only; an unknown token, or one now registered to
  // someone else, is ignored.
  async execute(token: string, userId: string): Promise<void> {
    if (!token || !userId) return;
    try {
      await this.pushNotificationService.delete({ token, userId });
      return;
    } catch (err) {
      this.exceptionService.notFoundException(
        NotificationsExceptionMessages.NOTIFICATIONS_001,
      );
    }
  }
}
