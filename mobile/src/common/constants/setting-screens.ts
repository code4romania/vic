import bell from '../../assets/svg/bell';
import identification from '../../assets/svg/identification';
import information from '../../assets/svg/information';
import key from '../../assets/svg/key';
import logout from '../../assets/svg/logout';
import user from '../../assets/svg/user';
import { SETTINGS_ROUTES } from '../enums/setting-routes';

export const SETTING_SCREENS = [
  { icon: user, label: 'Date cont', route: SETTINGS_ROUTES.ACCOUNT_DATA },
  { icon: identification, label: 'Date identitate', route: SETTINGS_ROUTES.ACCOUNT_DATA },
  { icon: key, label: 'Schimbă parola', route: SETTINGS_ROUTES.CHANGE_PASSWORD },
  { icon: bell, label: 'Setări notificări', route: SETTINGS_ROUTES.NOTIFICATIONS_SETTINGS },
  { icon: information, label: 'Informații', route: SETTINGS_ROUTES.INFORMATION },
  { icon: logout, label: 'Log out', route: SETTINGS_ROUTES.LOGOUT },
];
