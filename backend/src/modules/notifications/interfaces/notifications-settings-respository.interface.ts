import {
  ICreateNotificationsSettingsOptions,
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
} from '../models/notifications-settings.model';

export interface INotificationsSettingsRepository {
  create(
    createNotiicationsSettings: ICreateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel>;
  update(
    userId: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel>;
  find(userId: string): Promise<INotificationsSettingsModel>;
}
