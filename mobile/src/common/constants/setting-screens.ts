import bell from '../../assets/svg/bell';
import identification from '../../assets/svg/identification';
import information from '../../assets/svg/information';
import key from '../../assets/svg/key';
import logout from '../../assets/svg/logout';
import user from '../../assets/svg/user';

export const SETTING_SCREENS = [
  { icon: user, label: 'Date cont', route: 'account-data' },
  { icon: identification, label: 'Date identitate', route: 'identity-data' },
  { icon: key, label: 'Schimbă parola', route: 'change-password' },
  { icon: bell, label: 'Setări notificări', route: 'notifications-settings' },
  { icon: information, label: 'Informații', route: 'CHANGE-ME' },
  { icon: logout, label: 'Log out', route: 'CHANGE-ME' },
];
