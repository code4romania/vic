import React, { useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import * as Linking from 'expo-linking';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import bell from '../assets/svg/bell';
import information from '../assets/svg/information';
import trash from '../assets/svg/trash';
import logoutIcon from '../assets/svg/logout';
import user from '../assets/svg/user';
import { useAuth } from '../hooks/useAuth';
import { NotificationContext } from '../contexts/notification/NotificationContext';
import { useUserProfile } from '../store/profile/profile.selector';
import useStore from '../store/store';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';
import { colors, radius, spacing } from '../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { Avatar, Badge, Chevron, Enter, ListRow, Sheet, VButton, VText } from '../components/ui';

export enum SETTINGS_ROUTES {
  ACCOUNT_DATA = 'account-data',
  NOTIFICATIONS_SETTINGS = 'notifications-settings',
  INFORMATION = 'information',
  LOGOUT = 'logout',
  DELETE_ACCOUNT = 'delete-account',
  // VIC 2.0: the volunteer page and the organization search left the tab bar and live under Profil.
  MY_ORGANIZATIONS = 'volunteer',
  SEARCH_ORGANIZATIONS = 'search',
}

const RowIcon = ({ xml }: { xml: string }) => (
  <View style={styles.rowIcon}>
    <SvgXml xml={xml} width={20} height={20} />
  </View>
);

/**
 * VIC 2.0 Profil (canvas board "Profil"): who you are, your organizations (tap one to make it active
 * and open its page; this replaces the old drawer) and the settings. Log out asks first.
 */
const Settings = ({ navigation }: any) => {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const onScroll = useTabBarScroll();
  const logoutSheet = useRef<BottomSheetModal>(null);

  const { userProfile } = useUserProfile();
  const { setActiveOrganization } = useStore();
  const { mutate: switchOrganization } = useSwitchOrganizationMutation();
  const { logout } = useAuth();
  const { unsubscribe } = useContext(NotificationContext);

  const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ');
  const place = userProfile?.location?.name;
  const organizations = userProfile?.myOrganizations ?? [];
  const activeId = userProfile?.activeOrganization?.id;

  const onOpenOrganization = (organization: IOrganizationVolunteer) => {
    if (organization.id !== activeId) {
      setActiveOrganization(organization);
      switchOrganization({ organizationId: organization.id });
    }
    navigation.navigate(SETTINGS_ROUTES.MY_ORGANIZATIONS);
  };

  const onInformation = () => {
    if (process.env.EXPO_PUBLIC_INFORMATION_LINK) {
      Linking.openURL(process.env.EXPO_PUBLIC_INFORMATION_LINK).catch(() => undefined);
    }
  };

  const onLogout = () => {
    logoutSheet.current?.dismiss();
    // unregister the push token, then sign out
    unsubscribe();
    logout();
  };

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="profile"
      >
        <Enter>
          <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
            {t('profile')}
          </VText>
        </Enter>

        <Enter index={1} style={styles.me}>
          <Avatar name={name || '?'} uri={userProfile?.profilePicture} size={64} />
          <View style={styles.meText}>
            <VText variant="h2" numberOfLines={1}>
              {name}
            </VText>
            <VText variant="sub" numberOfLines={1}>
              {[userProfile?.email, place].filter(Boolean).join(' · ')}
            </VText>
          </View>
        </Enter>

        <Enter index={2} style={styles.section}>
          <VText variant="h2">{t('my_organizations')}</VText>
          {organizations.map((organization) => (
            <ListRow
              key={organization.id}
              leading={
                <Avatar
                  name={organization.name}
                  uri={organization.logo}
                  size={44}
                  shape="rounded"
                />
              }
              title={organization.name}
              subtitle={
                organization.volunteerProfileId ? undefined : `${t('volunteer_profile_missing')}`
              }
              trailing={
                <View style={styles.trailing}>
                  {organization.id === activeId && <Badge label={`${t('active')}`} tone="ok" />}
                  <Chevron />
                </View>
              }
              onPress={() => onOpenOrganization(organization)}
              testID={`profile-organization-${organization.id}`}
            />
          ))}
          <ListRow
            leading={
              <View style={[styles.rowIcon, styles.addIcon]}>
                <VText variant="h2" color={colors.navy}>
                  +
                </VText>
              </View>
            }
            title={`${t('join_organization')}`}
            onPress={() => navigation.navigate(SETTINGS_ROUTES.SEARCH_ORGANIZATIONS)}
            divider={false}
            testID="profile-join"
          />
        </Enter>

        <Enter index={3} style={styles.section}>
          <VText variant="h2">{t('section_settings')}</VText>
          <ListRow
            leading={<RowIcon xml={user} />}
            title={`${t('heading')}`}
            onPress={() => navigation.navigate(SETTINGS_ROUTES.ACCOUNT_DATA)}
            testID="profile-account"
          />
          <ListRow
            leading={<RowIcon xml={bell} />}
            title={`${t('notification')}`}
            onPress={() => navigation.navigate(SETTINGS_ROUTES.NOTIFICATIONS_SETTINGS)}
            testID="profile-notifications"
          />
          <ListRow
            leading={<RowIcon xml={information} />}
            title={`${t('information')}`}
            onPress={onInformation}
            testID="profile-information"
          />
          <ListRow
            leading={<RowIcon xml={trash} />}
            title={`${t('delete')}`}
            onPress={() => navigation.navigate(SETTINGS_ROUTES.DELETE_ACCOUNT)}
            testID="profile-delete"
          />
          <ListRow
            leading={<RowIcon xml={logoutIcon} />}
            title={`${t('logout')}`}
            destructive
            divider={false}
            onPress={() => logoutSheet.current?.present()}
            testID="profile-logout"
          />
        </Enter>

        <VText variant="cap" style={styles.footer}>
          {t('footer')}
        </VText>
      </Animated.ScrollView>

      <Sheet
        ref={logoutSheet}
        title={`${t('modal.confirm_logout.heading')}`}
        subtitle={`${t('modal.confirm_logout.paragraph')}`}
        testID="logout-sheet"
      >
        <VButton
          variant="danger"
          label={`${t('modal.confirm_logout.action_label')}`}
          onPress={onLogout}
          testID="logout-confirm"
        />
        <VButton
          variant="soft"
          label={`${t('general:back')}`}
          onPress={() => logoutSheet.current?.dismiss()}
        />
      </Sheet>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.gutter },
  title: { marginTop: 16 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  meText: { flex: 1, gap: 2, minWidth: 0 },
  section: { marginTop: 28, gap: 2 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: { backgroundColor: colors.status.accent.bg },
  footer: { textAlign: 'center', marginTop: 32 },
});
