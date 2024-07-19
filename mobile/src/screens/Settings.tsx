import React, { useContext } from 'react';
import bell from '../assets/svg/bell';
import identification from '../assets/svg/identification';
import information from '../assets/svg/information';
import key from '../assets/svg/key';
import trash from '../assets/svg/trash';
import logoutIcon from '../assets/svg/logout';
import user from '../assets/svg/user';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Text, Divider, List, useTheme, Icon } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import i18n from '../common/config/i18n';
import PressableContainer from '../components/PressableContainer';
import * as Linking from 'expo-linking';
import ImageWithPreload from '../components/ImageWithPreload';
import { NotificationContext } from '../contexts/notification/NotificationContext';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/Screen';

export enum SETTINGS_ROUTES {
  ACCOUNT_DATA = 'account-data',
  IDENTITY_DATA = 'identity-data',
  CHANGE_PASSWORD = 'change-password',
  NOTIFICATIONS_SETTINGS = 'notifications-settings',
  INFORMATION = 'information',
  LOGOUT = 'logout',
  DELETE_ACCOUNT = 'delete-account',
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
  { icon: trash, label: i18n.t('settings:delete'), route: SETTINGS_ROUTES.DELETE_ACCOUNT },
  { icon: logoutIcon, label: i18n.t('settings:logout'), route: SETTINGS_ROUTES.LOGOUT },
];

interface IListItem {
  icon: string;
  label: string;
  route: string;
}

const Settings = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  // theme
  const theme = useTheme();
  // auth
  const { userProfile } = useUserProfile();
  const { logout } = useAuth();
  const { unsubscribe } = useContext(NotificationContext);

  const handleItemPress = (route: string) => {
    if (route === SETTINGS_ROUTES.INFORMATION) {
      onInfoListItemPress();
    } else if (route === SETTINGS_ROUTES.LOGOUT) {
      onLogout();
    } else {
      navigation.navigate(route);
    }
  };

  const onInfoListItemPress = () => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_INFORMATION_LINK}`);
  };

  const onLogout = () => {
    // unregister token
    unsubscribe();
    // logout
    logout();
  };

  const renderItem = ({ item }: { item: IListItem }) => (
    <PressableContainer onPress={handleItemPress.bind(null, item.route)}>
      <View style={styles.screen}>
        <View style={{ ...styles.iconWrapper, backgroundColor: theme['cool-gray-100'] }}>
          <SvgXml xml={item.icon} />
        </View>
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="label"
          style={{ color: theme['cool-gray-800'] }}
        >
          {item.label}
        </Text>
      </View>
    </PressableContainer>
  );

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[styles.childrenContainer, { paddingTop: insets.top + 16 }]}
    >
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={styles.title}>
        {`${t('title')}`}
      </Text>
      <View style={styles.profileContainer}>
        {!userProfile?.profilePicture && (
          <View style={{ ...styles.iconWrapper, backgroundColor: theme['cool-gray-100'] }}>
            <Icon
              name="user"
              style={{ ...styles.imagePlaceholder, color: theme['cool-gray-500'] }}
            />
          </View>
        )}
        {userProfile?.profilePicture && (
          <ImageWithPreload source={userProfile?.profilePicture} styles={styles.image} />
        )}
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="h3"
        >{`${userProfile?.firstName} ${userProfile?.lastName}`}</Text>
      </View>
      <List
        data={SETTING_SCREENS}
        ItemSeparatorComponent={Divider}
        renderItem={renderItem}
        style={styles.list}
        bouncesZoom={false}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

export default Settings;

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 100,
  },
  imagePlaceholder: { width: 24, height: 24 },
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
  },
  screen: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  childrenContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: { paddingLeft: 8, marginBottom: 16 },
});
