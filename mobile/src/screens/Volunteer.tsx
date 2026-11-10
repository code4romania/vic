import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
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
  StatusBarScrim,
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
  const onScroll = useTabBarScroll();

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

  const back = navigation.canGoBack() ? (
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
        {back}
        <Enter style={styles.head}>
          <Avatar
            name={organization.name}
            uri={organization.logo}
            size={72}
            shape="rounded"
            onCanvas
          />
          <VText variant="largeTitle" style={styles.name} accessibilityRole="header">
            {organization.name}
          </VText>
        </Enter>

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
      <StatusBarScrim />
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
  head: { marginTop: 16, gap: 12 },
  name: { fontSize: 28, lineHeight: 34 },
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
