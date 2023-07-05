import { Injectable } from '@nestjs/common';
import {
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
} from './models/notifications-settings.model';
import { NotificationsSettingsRepository } from './repositories/notifications-settings.repository';

@Injectable()
export class NotificationsSettingsFacade {
  constructor(
    private readonly notificationsSettingsRepository: NotificationsSettingsRepository,
  ) {}

  async create(): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.create();
  }

  async find(id: string): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.find(id);
  }

  async update(
    id: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    return this.notificationsSettingsRepository.update(id, updates);
  }
}
