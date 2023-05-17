import bell from '../../assets/svg/bell';
import identification from '../../assets/svg/identification';
import information from '../../assets/svg/information';
import key from '../../assets/svg/key';
import logout from '../../assets/svg/logout';
import user from '../../assets/svg/user';
import { SETTINGS_ROUTES } from '../enums/setting-routes';
import i18n from '../config/i18n';

export const SETTING_SCREENS = [
  { icon: user, label: i18n.t('settings:heading'), route: SETTINGS_ROUTES.ACCOUNT_DATA },
  {
    icon: identification,
    label: i18n.t('settings:identity'),
    route: SETTINGS_ROUTES.IDENTITY_DATA,
  },
  { icon: key, label: i18n.t('settings:password'), route: SETTINGS_ROUTES.CHANGE_PASSWORD },
  {
    icon: bell,
    label: i18n.t('settings:notification'),
    route: SETTINGS_ROUTES.NOTIFICATIONS_SETTINGS,
  },
  { icon: information, label: i18n.t('settings:information'), route: SETTINGS_ROUTES.INFORMATION },
  { icon: logout, label: 'Log out', route: SETTINGS_ROUTES.LOGOUT },
];
