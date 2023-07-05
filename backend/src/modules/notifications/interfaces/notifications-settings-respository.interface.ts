import {
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
} from '../models/notifications-settings.model';

export interface INotificationsSettingsRepository {
  create(): Promise<INotificationsSettingsModel>;
  update(
    id: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel>;
  find(id: string): Promise<INotificationsSettingsModel>;
}
