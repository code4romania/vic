import { NotificationsFrom } from '../../common/enums/notifications-from.enum';
import { INotificationsSettings } from '../../common/interfaces/user-profile.interface';
import API from '../api';

export interface ISettingsUpdatesPayload {
  notificationsFrom?: NotificationsFrom;
  notificationsViaEmail?: boolean;
  notificationsViaPush?: boolean;
}

export const updateSettings = async (
  id: string,
  newSettings: ISettingsUpdatesPayload,
): Promise<INotificationsSettings> => {
  return API.patch(`/mobile/settings/${id}`, newSettings).then((res) => res.data);
};

export const registerPushToken = async (token: string): Promise<void> => {
  return API.post('/mobile/push-notifications/register', { token }).then((res) => res.data);
};

export const unregisterPushToken = async (token: string): Promise<void> => {
  return API.patch('/mobile/push-notifications/unregister', { token }).then((res) => res.data);
};
