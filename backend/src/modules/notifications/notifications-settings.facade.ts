import { Injectable } from '@nestjs/common';
import {
  ICreateNotificationsSettingsOptions,
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
} from './models/notifications-settings.model';
import { NotificationsSettingsRepository } from './repositories/notifications-settings.repository';

@Injectable()
export class NotificationsSettingsFacade {
  constructor(
    private readonly notificationsSettingsRepository: NotificationsSettingsRepository,
  ) {}

  async create(
    data: ICreateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.create(data);
  }

  async find(userId: string): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.find(userId);
  }

  async update(
    userId: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.update(userId, updates);
  }
}
