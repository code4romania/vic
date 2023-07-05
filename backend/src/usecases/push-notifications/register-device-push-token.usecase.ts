import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  CreatePushTokenOptions,
  IPushTokenModel,
} from 'src/modules/notifications/models/push-token.model';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';

@Injectable()
export class RegisterDevicePushTokenUseCase
  implements IUseCaseService<IPushTokenModel>
{
  private readonly logger = new Logger(RegisterDevicePushTokenUseCase.name);

  constructor(
    private readonly pushNotificationService: PushNotificationsFacade,
  ) {}

  async execute(
    createPushTokenOptions: CreatePushTokenOptions,
  ): Promise<IPushTokenModel> {
    // 1. Check if the token already exists in the database
    const existingToken = await this.pushNotificationService.find({
      token: createPushTokenOptions.token,
    });
    // 1.1. If it doesn't exist, create it
    if (!existingToken) {
      return this.pushNotificationService.create({
        ...createPushTokenOptions,
      });
    }
    // 1.2. If it does and the userId is the same, just update timestamp to track stale tokens
    if (existingToken.userId === createPushTokenOptions.userId) {
      return this.pushNotificationService.update(existingToken.id, {});
    } else {
      // 1.3. If it does and the userId is different, update userId and timestamp (only 1 user per device to receive notifications)
      return this.pushNotificationService.update(existingToken.id, {
        ...existingToken,
        userId: createPushTokenOptions.userId,
      });
    }
  }
}
