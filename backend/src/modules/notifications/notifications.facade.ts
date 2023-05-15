import { Injectable } from '@nestjs/common';

import { PushTokensRepository } from './repositories/push-tokens.repository';
import {
  IPushTokenModel,
  CreatePushTokenOptions,
} from './models/push-token.model';
import { PushNotificationsService } from './push-notifications.service';

@Injectable()
export class PushNotificationsFacade {
  constructor(
    private readonly pushTokensRepository: PushTokensRepository,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  // send(
  //   tokens: string[],
  //   title: string,
  //   body: string,
  // ): Promise<ExpoPushTicket[]> {
  //   return this.pushNotificationsService.send(tokens, title, body);
  // }

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

  async delete(id: string): Promise<string> {
    return this.pushTokensRepository.delete(id);
  }
}
