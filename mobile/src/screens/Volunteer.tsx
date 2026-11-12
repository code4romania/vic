import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import volunteerUserSVG from '../assets/svg/volunteer-user';
import volunteerClockSVG from '../assets/svg/volunteer-clock';
import volunteerDocumentSVG from '../assets/svg/doc';
import { useVolunteerStats } from '../services/volunteer/volunteer.service';
import { useGetUserProfileQuery } from '../services/user/user.service';
import { useUserProfile } from '../store/profile/profile.selector';
import { colors, fonts, radius, shadows, spacing } from '../common/theme/tokens';
import { MAX_FONT_SCALE } from '../common/constants/constants';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventIcon } from '../components/events/EventIcons';
import {
  Avatar,
  EmptyState,
  Enter,
  Group,
  ListRow,
  PressableScale,
  VButton,
  VText,
} from '../components/ui';

const RowIcon = ({ xml }: { xml: string }) => (
  <View style={styles.rowIcon}>
    <SvgXml xml={xml} width={20} height={20} />
  </View>
);

/**
 * VIC 2.0 profile in an organization (canvas board "ProfilOrg"): the active organization with the
 * open hours requests and documents, a prompt while the volunteer profile is incomplete, the links to
 * the organization, hours, documents and volunteer profile, and leaving the organization.
 */
const Volunteer = ({ navigation }: any) => {
  const { t } = useTranslation('volunteer');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const barHeight = insets.top + 56;
  const canGoBack = navigation.canGoBack();
  const headY = useSharedValue(0);
  const titleY = useSharedValue(0);
  const titleHeight = useSharedValue(0);
  const titleBottom = useDerivedValue(() => headY.value + titleY.value + titleHeight.value);
  const [compactAccessible, setCompactAccessible] = React.useState(false);
  const compactOpacity = useDerivedValue(() =>
    titleHeight.value > 0
      ? interpolate(
          scrollY.value,
          [titleBottom.value - barHeight - titleHeight.value, titleBottom.value - barHeight],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0,
  );
  const compactStyle = useAnimatedStyle(() => ({ opacity: compactOpacity.value }));
  useAnimatedReaction(
    () => compactOpacity.value > 0.5,
    (visible, previous) => {
      if (visible !== previous) {
        runOnJS(setCompactAccessible)(visible);
      }
    },
  );
  // The logo starts at safe-area top + 12 + 40pt back slot + 16pt head margin = bar bottom + 12.
  const shadowStart = Math.max(0, insets.top + 68 - barHeight);
  const headerShadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      scrollY.value,
      [shadowStart, shadowStart + 12],
      [0, 0.06],
      Extrapolation.CLAMP,
    ),
  }));

  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const { refetch: refetchUserProfile } = useGetUserProfileQuery();
  const { data: stats, refetch: refetchStats } = useVolunteerStats(
    organization?.volunteerId as string,
  );

  useFocusEffect(
    React.useCallback(() => {
      refetchUserProfile();
      refetchStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const back = canGoBack ? (
    <PressableScale
      onPress={navigation.goBack}
      style={[styles.back, shadows.back]}
      accessibilityLabel={`${t('general:back')}`}
      testID="volunteer-back"
    >
      <EventIcon name="back" size={20} />
    </PressableScale>
  ) : null;

  if (!organization) {
    return (
      <View style={[styles.screen, styles.content, { paddingTop: insets.top + 12 }]}>
        {back}
        <EmptyState
          title={`${t('no_org_added')}`}
          description={`${t('no_org_description')}`}
          actionLabel={`${t('join_organization')}`}
          onAction={() => navigation.navigate('search')}
          testID="volunteer-empty"
        />
      </View>
    );
  }

  const profileMissing = stats ? !stats.volunteerProfileId : !organization.volunteerProfileId;
  const pendingLogs = Number(stats?.activityLogCount) || 0;
  const pendingDocuments = Number(stats?.contractCount) || 0;

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
        testID="volunteer"
      >
        {/* The old back slot: the logo stays at safe-area top + 68, just below the pinned bar.
            Kept without a back button too, so the bar never covers the logo at rest. */}
        <View style={styles.backSpacer} />
        <View
          style={styles.head}
          onLayout={(event) => {
            headY.value = event.nativeEvent.layout.y;
          }}
        >
          {/* Enter does not forward onLayout; its content starts at the wrapper's origin. */}
          <Enter style={styles.headContent}>
            <Avatar
              name={organization.name}
              uri={organization.logo}
              size={64}
              shape="rounded"
              onCanvas
            />
            <VText
              variant="largeTitle"
              style={styles.name}
              accessibilityRole="header"
              onLayout={(event) => {
                titleY.value = event.nativeEvent.layout.y;
                titleHeight.value = event.nativeEvent.layout.height;
              }}
            >
              {organization.name}
            </VText>
          </Enter>
        </View>

        <Enter index={1} style={styles.stats}>
          <View style={[styles.stat, styles.statHours]} testID="volunteer-stat-logs">
            <VText style={[styles.statValue, { color: colors.figure.amber }]}>
              {`${pendingLogs}`}
            </VText>
            <VText variant="cap" color={colors.status.wait.fg}>
              {t('stats.pending_logs')}
            </VText>
          </View>
          <View style={[styles.stat, styles.statDocuments]} testID="volunteer-stat-documents">
            <VText
              style={[styles.statValue, { color: colors.navy }]}
            >{`${pendingDocuments}`}</VText>
            <VText variant="cap" color={colors.navy}>
              {t('stats.pending_documents')}
            </VText>
          </View>
        </Enter>

        {profileMissing && (
          <Enter index={2} style={styles.prompt} testID="volunteer-profile-prompt">
            <VText variant="h3" color={colors.status.wait.fg}>
              {t('prompt.title')}
            </VText>
            <VText variant="sub" color={colors.status.wait.fg}>
              {t('prompt.description')}
            </VText>
            <VButton
              size="small"
              variant="navy"
              label={`${t('prompt.action')}`}
              onPress={() => navigation.navigate('volunteer-profile')}
              style={styles.promptAction}
              testID="volunteer-profile-complete"
            />
          </Enter>
        )}

        <Enter index={3} style={styles.section}>
          <Group>
            <ListRow
              leading={
                <Avatar
                  name={organization.name}
                  uri={organization.logo}
                  size={40}
                  shape="rounded"
                />
              }
              title={`${t('menu_items.organization_profile.title')}`}
              subtitle={`${t('menu_items.organization_profile.subtitle')}`}
              onPress={() =>
                navigation.navigate('organization-profile', { organizationId: organization.id })
              }
              testID="volunteer-organization"
            />
            <ListRow
              leading={<RowIcon xml={volunteerClockSVG} />}
              title={`${t('menu_items.activity_log.title')}`}
              subtitle={
                pendingLogs
                  ? `${t(
                      pendingLogs === 1
                        ? 'menu_items.activity_log.subtitle.one'
                        : 'menu_items.activity_log.subtitle.many',
                      { number: pendingLogs },
                    )}`
                  : undefined
              }
              onPress={() => navigation.navigate('activity-logs')}
              testID="volunteer-hours"
            />
            <ListRow
              leading={<RowIcon xml={volunteerDocumentSVG} />}
              title={`${t('general:documents')}`}
              subtitle={
                pendingDocuments
                  ? `${t('menu_items.documents.subtitle', { number: pendingDocuments })}`
                  : undefined
              }
              onPress={() => navigation.navigate('documents')}
              testID="volunteer-documents"
            />
            <ListRow
              leading={<RowIcon xml={volunteerUserSVG} />}
              title={`${t('menu_items.volunteer_profile.title')}`}
              subtitle={
                profileMissing
                  ? `${t('menu_items.volunteer_profile.subtitle')}`
                  : `${t('menu_items.volunteer_profile.details')}`
              }
              onPress={() => navigation.navigate('volunteer-profile')}
              testID="volunteer-profile"
            />
            <ListRow
              title={`${t('leave')}`}
              destructive
              divider={false}
              onPress={() =>
                navigation.navigate('leave-organization', {
                  volunteerId: organization.volunteerId,
                  name: organization.name,
                  logo: organization.logo,
                })
              }
              testID="volunteer-leave"
            />
          </Group>
        </Enter>
      </Animated.ScrollView>
      <Animated.View
        testID="volunteer-bar-top"
        pointerEvents="box-none"
        style={[styles.pinnedBar, { height: barHeight, paddingTop: insets.top }, headerShadow]}
      >
        <View style={styles.topRow} pointerEvents="box-none">
          {back}
          <Animated.View
            pointerEvents="none"
            accessibilityElementsHidden={!compactAccessible}
            importantForAccessibility={compactAccessible ? 'auto' : 'no-hide-descendants'}
            style={[styles.compactOrganization, compactStyle]}
          >
            <Avatar name={organization.name} uri={organization.logo} size={32} shape="rounded" />
            <VText
              color={colors.ink}
              style={styles.compactName}
              numberOfLines={1}
              maxFontSizeMultiplier={MAX_FONT_SCALE.title}
            >
              {organization.name}
            </VText>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default Volunteer;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { height: 40 },
  head: { marginTop: 16 },
  // logo and name on one row; the name takes the rest of the width and may wrap
  headContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pinnedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.canvas,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 0,
  },
  topRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-start',
    // Preserve the back button's old top at safe-area top + 12; center compact content beside it.
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    gap: 12,
  },
  compactOrganization: { flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', gap: 10 },
  compactName: { fontFamily: fonts.title, fontSize: 17, flexShrink: 1 },
  name: { flex: 1, fontSize: 28, lineHeight: 34 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: {
    flex: 1,
    borderRadius: radius.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  statHours: { backgroundColor: colors.white, ...shadows.card },
  statDocuments: { backgroundColor: colors.white, ...shadows.card },
  statValue: { fontFamily: fonts.title, fontSize: 22, lineHeight: 28, color: colors.ink },
  prompt: {
    marginTop: 18,
    borderRadius: radius.card,
    padding: 16,
    gap: 6,
    // on the gray canvas: a white card, the amber stays on the text
    backgroundColor: colors.white,
    ...shadows.card,
  },
  promptAction: { alignSelf: 'flex-start', marginTop: 6 },
  section: { marginTop: 20 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
