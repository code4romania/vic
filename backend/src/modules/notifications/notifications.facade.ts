import { Injectable } from '@nestjs/common';
import { PushTokensRepository } from './repositories/push-tokens.repository';
import {
  IPushTokenModel,
  CreatePushTokenOptions,
  DeletePushTokenOptions,
} from './models/push-token.model';
import { PushNotificationsService } from './services/push-notifications.service';
import { SendNotificationData } from './models/send-notification-data.model';

@Injectable()
export class PushNotificationsFacade {
  constructor(
    private readonly pushTokensRepository: PushTokensRepository,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  send = async (data: SendNotificationData): Promise<void> => {
    return this.pushNotificationsService.send(data);
  };

  async find(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel> {
    return this.pushTokensRepository.find(findOptions);
  }

  async findMany(
    findOptions: Partial<IPushTokenModel>,
  ): Promise<IPushTokenModel[]> {
    return this.pushTokensRepository.findMany(findOptions);
  }

  async update(
    id: string,
    updates: Partial<IPushTokenModel>,
  ): Promise<IPushTokenModel> {
    return this.pushTokensRepository.update(id, updates);
  }

  async create(
    createPushToken: CreatePushTokenOptions,
  ): Promise<IPushTokenModel> {
    return this.pushTokensRepository.create(createPushToken);
  }

  async delete(options: DeletePushTokenOptions): Promise<string> {
    return this.pushTokensRepository.delete(options);
  }

  async deleteMany(options: DeletePushTokenOptions): Promise<void> {
    return this.pushTokensRepository.deleteMany(options);
  }
}
