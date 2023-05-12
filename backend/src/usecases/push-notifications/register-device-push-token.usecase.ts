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

  async execute(createPushTokenOptions: CreatePushTokenOptions): Promise<void> {
    // 1. Check if the token already exists in the database with *deviceId* and *userId* combination
    const existingToken = await this.pushNotificationService.find({
      deviceId: createPushTokenOptions.deviceId,
      userId: createPushTokenOptions.userId,
    });
    // 2. If it does and the data is the same, return the token
    if (existingToken && existingToken.token === createPushTokenOptions.token) {
      return;
    }
    // 3. If it does and the data is different or doesn't exist, create/update the token
    this.pushNotificationService.createOrUpdate(existingToken.id, {
      ...existingToken,
      ...createPushTokenOptions,
    });
  }
}
