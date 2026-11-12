import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import Toast from 'react-native-toast-message';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../store/profile/profile.selector';
import { useActivateOrganization } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { romanianNeedsDe } from '../common/utils/plural';
import { usePersonalStatistics } from '../services/statistics/statistics.service';
import { useGetUserProfileQuery } from '../services/user/user.service';
import {
  IOrganizationVolunteer,
  isCandidateVolunteer,
} from '../common/interfaces/organization-list-item.interface';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { CompactTitleBar } from '../components/ui/ScreenChrome';
import { Sheet, VButton } from '../components/ui';
import { AppText, Group, HexAvatar, ListRow, RowChevron, StatusChip } from '../design/components';
import { enter } from '../design/motion';
import { palette } from '../design/tokens';
import {
  BellIcon,
  ICON_STROKE,
  InfoIcon,
  LogOutIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from '../design/icons';

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

/** The yellow 40×44 hexagon with a navy plus („Alătură-te unei organizații”). */
const JoinHexagon = () => (
  <View
    style={styles.joinHex}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <Svg width={40} height={44} viewBox="0 0 40 44" style={styles.joinHexSvg}>
      <Path d="M20 0 L40 11 L40 33 L20 44 L0 33 L0 11 Z" fill={palette.yellow} />
    </Svg>
    <PlusIcon size={18} color={palette.navy} strokeWidth={ICON_STROKE + 0.5} />
  </View>
);

const Stat = ({ value, label, testID }: { value: string; label: string; testID: string }) => (
  <View style={styles.stat} testID={testID}>
    <AppText
      variant="display"
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      style={styles.statValue}
    >
      {value}
    </AppText>
    <AppText variant="label" color={palette.ink2} numberOfLines={2}>
      {label}
    </AppText>
  </View>
);

/**
 * Profil „Îndrăzneț” (handbook prototype "Profil"): the yellow hexagon with your initial and your
 * first name in Bricolage 46, your numbers, your organizations (tap one to make it active and open
 * its page; this replaces the old drawer), the settings, and the destructive rows on their own.
 * Log out asks first.
 */
const Settings = ({ navigation }: any) => {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  const reduced = useReducedMotion();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const logoutSheet = useRef<BottomSheetModal>(null);

  const { userProfile } = useUserProfile();
  const { activate } = useActivateOrganization();
  const { logout } = useAuth();
  const { data: stats, refetch: refetchStats } = usePersonalStatistics();
  const { refetch: refetchProfile } = useGetUserProfileQuery();

  // Memberships and statistics can change while the app is open: refresh on focus.
  useFocusEffect(
    useCallback(() => {
      refetchStats();
      refetchProfile();
    }, [refetchStats, refetchProfile]),
  );

  const years = (count: number) => {
    if (count < 1) {
      return `${t('stats.years_less')}`;
    }
    if (count === 1) {
      return `${t('stats.year')}`;
    }
    // Romanian: "2 ani", but "20 de ani"
    return `${t(romanianNeedsDe(count) ? 'stats.years_de' : 'stats.years', { count })}`;
  };

  const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ');
  const firstName = userProfile?.firstName || name;
  const place = userProfile?.location?.name;
  const organizations = userProfile?.myOrganizations ?? [];
  const activeId = userProfile?.activeOrganization?.id;

  const onOpenOrganization = async (organization: IOrganizationVolunteer) => {
    // A Candidate only sees the organization's page, which says it waits for activation (#590).
    if (isCandidateVolunteer(organization)) {
      navigation.navigate('organization-profile', { organizationId: organization.id });
      return;
    }
    try {
      // the backend must have the new active organization before its page loads
      await activate(organization);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(error?.response?.data?.code_error)}`,
      });
      return;
    }
    navigation.navigate(SETTINGS_ROUTES.MY_ORGANIZATIONS);
  };

  // the VIC page on NGO Hub, as in the store builds (eas.json), also when a local .env lacks it
  const onInformation = () => {
    Linking.openURL(
      process.env.EXPO_PUBLIC_INFORMATION_LINK || 'https://www.ngohub.ro/ro/vic',
    ).catch(() => undefined);
  };

  const onLogout = async () => {
    logoutSheet.current?.dismiss();
    // unregisters the push token first, then ends the session and clears the local data
    await logout();
  };

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="profile"
      >
        <Animated.View entering={enter(0, reduced)} testID="settings-header">
          <View style={styles.me}>
            <HexAvatar name={firstName || '?'} size="lg" tone="yellow" />
            <View style={styles.meText}>
              <AppText variant="overline" color={palette.ink2}>
                {t('your_profile')}
              </AppText>
              <AppText
                variant="largeTitle"
                accessibilityRole="header"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                style={styles.name}
              >
                {firstName}
              </AppText>
            </View>
          </View>
          {!!(userProfile?.email || place) && (
            <AppText variant="caption" color={palette.ink2} style={styles.email}>
              {[userProfile?.email, place].filter(Boolean).join(' · ')}
            </AppText>
          )}
        </Animated.View>

        <Animated.View entering={enter(1, reduced)} style={styles.stats}>
          <Stat
            value={stats ? `${stats.approvedHours}` : '–'}
            label={`${t('stats.hours')}`}
            testID="profile-stat-hours"
          />
          <Stat
            value={stats ? `${stats.events}` : '–'}
            label={`${t('stats.events')}`}
            testID="profile-stat-events"
          />
          <Stat
            value={stats ? years(stats.yearsInVic) : '–'}
            label={`${t('stats.in_vic')}`}
            testID="profile-stat-years"
          />
        </Animated.View>

        <Animated.View entering={enter(2, reduced)} style={styles.section}>
          <AppText variant="title" accessibilityRole="header">
            {t('my_organizations')}
          </AppText>
        </Animated.View>
        <Animated.View entering={enter(3, reduced)}>
          <Group>
            {organizations.map((organization) => (
              <ListRow
                key={organization.id}
                avatar={{ name: organization.name }}
                title={organization.name}
                titleLines={2}
                subtitle={
                  isCandidateVolunteer(organization) || organization.volunteerProfileId
                    ? undefined
                    : `${t('volunteer_profile_missing')}`
                }
                trailing={
                  isCandidateVolunteer(organization) ? (
                    <StatusChip label={`${t('waiting')}`} kind="wait" />
                  ) : organization.id === activeId ? (
                    <StatusChip label={`${t('active')}`} kind="ok" />
                  ) : (
                    <RowChevron />
                  )
                }
                onPress={() => onOpenOrganization(organization)}
                testID={`profile-organization-${organization.id}`}
              />
            ))}
            <ListRow
              leading={<JoinHexagon />}
              title={`${t('join_organization')}`}
              trailing={null}
              onPress={() => navigation.navigate(SETTINGS_ROUTES.SEARCH_ORGANIZATIONS)}
              testID="profile-join"
            />
          </Group>
        </Animated.View>

        <Animated.View entering={enter(4, reduced)} style={styles.section}>
          <AppText variant="title" accessibilityRole="header">
            {t('section_settings')}
          </AppText>
        </Animated.View>
        <Animated.View entering={enter(5, reduced)}>
          <Group>
            <ListRow
              icon={UserIcon}
              title={`${t('heading')}`}
              onPress={() => navigation.navigate(SETTINGS_ROUTES.ACCOUNT_DATA)}
              testID="profile-account"
            />
            <ListRow
              icon={BellIcon}
              title={`${t('notification')}`}
              onPress={() => navigation.navigate(SETTINGS_ROUTES.NOTIFICATIONS_SETTINGS)}
              testID="profile-notifications"
            />
            <ListRow
              icon={InfoIcon}
              title={`${t('information')}`}
              onPress={onInformation}
              testID="profile-information"
            />
          </Group>
        </Animated.View>

        <Animated.View entering={enter(6, reduced)} style={styles.dangerGroup}>
          <Group>
            <ListRow
              icon={TrashIcon}
              title={`${t('delete')}`}
              danger
              trailing={null}
              onPress={() => navigation.navigate(SETTINGS_ROUTES.DELETE_ACCOUNT)}
              testID="profile-delete"
            />
            <ListRow
              icon={LogOutIcon}
              title={`${t('logout')}`}
              danger
              trailing={null}
              onPress={() => logoutSheet.current?.present()}
              testID="profile-logout"
            />
          </Group>
        </Animated.View>
      </Animated.ScrollView>
      <CompactTitleBar title={firstName || `${t('profile')}`} scrollY={scrollY} />

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

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.space.gutter },
  me: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  meText: { flex: 1, minWidth: 0 },
  // handbook: Bricolage 46 for the first name
  name: { fontSize: 46, lineHeight: 46, letterSpacing: -1.84, marginTop: 2 },
  email: { marginTop: theme.space.s },
  stats: { flexDirection: 'row', gap: theme.space.s, marginTop: theme.space.gutter },
  // handbook .tile: white, radius 22, number on top, label below
  stat: {
    flex: 1,
    minHeight: 96,
    borderRadius: 22,
    paddingVertical: theme.space.m,
    paddingHorizontal: theme.space.l,
    backgroundColor: theme.colors.card,
    justifyContent: 'space-between',
    gap: 6,
  },
  statValue: { fontSize: 32, lineHeight: 32, letterSpacing: -1.28 },
  // handbook .sect: 22 above, 10 below
  section: { marginTop: theme.space.section, marginBottom: theme.space.s, marginHorizontal: 2 },
  dangerGroup: { marginTop: theme.space.s },
  joinHex: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  joinHexSvg: { position: 'absolute', top: 0, left: 0 },
}));
