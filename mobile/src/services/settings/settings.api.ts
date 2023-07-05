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
