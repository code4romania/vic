import React from 'react';
import bell from '../assets/svg/bell';
import identification from '../assets/svg/identification';
import information from '../assets/svg/information';
import key from '../assets/svg/key';
import logoutIcon from '../assets/svg/logout';
import user from '../assets/svg/user';
import PageLayout from '../layouts/PageLayout';
import { Image, View, TouchableHighlight, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Text, Divider, List, useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import i18n from '../common/config/i18n';

export enum SETTINGS_ROUTES {
  ACCOUNT_DATA = 'account-data',
  IDENTITY_DATA = 'identity-data',
  CHANGE_PASSWORD = 'change-password',
  NOTIFICATIONS_SETTINGS = 'notifications-settings',
  INFORMATION = 'information',
  LOGOUT = 'logout',
}

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
  { icon: logoutIcon, label: 'Log out', route: SETTINGS_ROUTES.LOGOUT },
];

interface IListItem {
  icon: string;
  label: string;
  route: string;
}

const Settings = ({ navigation }: any) => {
  const { t } = useTranslation('settings');
  const theme = useTheme();
  const { logout } = useAuth();

  const handleItemPress = (route: string) => {
    if (route === SETTINGS_ROUTES.INFORMATION) {
      console.log('navigate to url');
    } else if (route === SETTINGS_ROUTES.LOGOUT) {
      logout();
    } else {
      navigation.navigate(route);
    }
  };

  const renderItem = ({ item }: { item: IListItem }) => (
    <TouchableHighlight
      onPress={() => handleItemPress(item.route)}
      activeOpacity={1}
      underlayColor={theme['cool-gray-100']}
    >
      <View style={styles.screen}>
        <View style={styles.iconWrapper}>
          <SvgXml xml={item.icon} />
        </View>
        <Text category="label" appearance="hint">
          {item.label}
        </Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <PageLayout title={t('title')}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: 'https://picsum.photos/200/300' }} style={styles.image} />
        <Text category="h2" appearance="hint">
          Andreea Popa
        </Text>
      </View>
      <List
        data={SETTING_SCREENS}
        ItemSeparatorComponent={Divider}
        renderItem={renderItem}
        style={styles.list}
      />
    </PageLayout>
  );
};

export default Settings;

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  image: { width: 48, height: 48, borderRadius: 100 },
  profileContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  screen: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
