import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import { queryKeys } from '../services/query-keys';
import { MAX_FONT_SCALE } from '../common/constants/constants';
import { isInactiveVolunteer } from '../common/interfaces/organization-list-item.interface';
import {
  useActivityLogsCounters,
  useActivityLogsInfiniteQuery,
} from '../services/activity-log/activity-log.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import { colors, fonts, radius, shadows, spacing } from '../common/theme/tokens';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { isTabRoute } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventIcon } from '../components/events/EventIcons';
import { LogRow } from '../components/hours/LogRow';
import ActivityLogSkeletonItem from '../components/skeleton/activity-log-skeleton-item';
import {
  EmptyState,
  Enter,
  groupedItem,
  PressableScale,
  SegmentedControl,
  Sheet,
  StatusBarScrim,
  VButton,
  VText,
} from '../components/ui';

// newest first, like the canvas
const ORDER = OrderDirection.DESC;

// white stat cards with a strong colored figure (Andrew, 9 Nov: no pastel blocks)
const STAT_TONE: Record<string, { bg: string; fg: string }> = {
  approved: { bg: colors.white, fg: colors.figure.green },
  pending: { bg: colors.white, fg: colors.figure.amber },
  rejected: { bg: colors.white, fg: colors.figure.red },
};

/**
 * VIC 2.0 Ore (canvas boards "Ore" and "OraDetaliu"): large title beside the add action, organization, hours
 * per status, a segmented control (În așteptare / Aprobate / Refuzate) and the entries. "+ Adaugă
 * ore" needs a volunteer profile; without one a sheet sends the volunteer to fill it in.
 */
const ActivityLogs = ({ navigation, route }: any) => {
  const { t } = useTranslation('activity_logs');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const [summaryHeight, setSummaryHeight] = useState(0);
  const [titleHeight, setTitleHeight] = useState(0);
  const [statusHeight, setStatusHeight] = useState(0);
  const profileSheet = useRef<BottomSheetModal>(null);

  const [status, setStatus] = useState<ActivityLogStatus>(ActivityLogStatus.PENDING);
  const { approvedHours, rejectedHours, pendingHours } = useActivityLogs();
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const inactive = isInactiveVolunteer(organization);
  const queryClient = useQueryClient();

  // The whole header (title, organization, totals, status) stays fixed and only the list scrolls
  // under it; the measured sections give the list its top padding, at any text size.
  const headerHeight =
    insets.top +
    12 +
    (titleHeight || 44) +
    (organization ? (summaryHeight || 140) + (statusHeight || 44) : 0) +
    6;
  const headerShadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 12], [0, 0.06], Extrapolation.CLAMP),
  }));

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: reloadActivityLogs,
    isRefetching,
  } = useActivityLogsInfiniteQuery(organization?.id, ORDER, '', status);

  // adding, editing or deleting an entry invalidates the list and these totals
  const { refetch: reloadCounters } = useActivityLogsCounters(organization?.volunteerId);

  const reload = useCallback(() => {
    reloadActivityLogs();
    reloadCounters();
  }, [reloadActivityLogs, reloadCounters]);

  useFocusEffect(
    useCallback(() => {
      // Mark every segment stale; reload only the current list and totals.
      queryClient.invalidateQueries(queryKeys.activityLogsAll, {
        refetchActive: false,
        refetchInactive: false,
      });
      reload();
    }, [queryClient, reload]),
  );

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.items) as IActivityLogItem[],
    [data],
  );

  const onAdd = () => {
    if (!organization?.volunteerProfileId) {
      profileSheet.current?.present();
      return;
    }
    navigation.navigate('add-activity-log');
  };

  const onOpen = (activityLogId: string) => navigation.navigate('activity-log', { activityLogId });

  const stats = [
    { key: 'approved', value: approvedHours, label: t('totals.approved') },
    { key: 'pending', value: pendingHours, label: t('totals.pending') },
    { key: 'rejected', value: rejectedHours, label: t('totals.rejected') },
  ];

  const header = (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 12 }, headerShadow]}>
      <View
        style={styles.pinnedTitle}
        onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}
      >
        <Enter>
          {/* Opened from the volunteer page: the back button joins the title row and the title
              drops to h2, as on Organizații, instead of a row of its own above a large title. */}
          <View testID="hours-title-row" style={styles.titleRow}>
            {!isTabRoute(route) && (
              <PressableScale
                onPress={navigation.goBack}
                style={[styles.back, shadows.back]}
                accessibilityLabel={`${t('general:back')}`}
                testID="hours-back"
              >
                <EventIcon name="back" size={20} />
              </PressableScale>
            )}
            <VText
              variant={isTabRoute(route) ? 'largeTitle' : 'h2'}
              accessibilityRole="header"
              numberOfLines={isTabRoute(route) ? undefined : 1}
              maxFontSizeMultiplier={isTabRoute(route) ? undefined : MAX_FONT_SCALE.title}
              style={styles.title}
            >
              {t('title')}
            </VText>
            {!inactive && !!organization && (
              <VButton
                size="small"
                variant="primary"
                label={`+ ${t('add_short')}`}
                accessibilityLabel={`${t('add')}`}
                onPress={onAdd}
                style={styles.addButton}
                hitSlop={2}
                maxFontSizeMultiplier={MAX_FONT_SCALE.title}
                testID="hours-add"
              />
            )}
          </View>
        </Enter>
      </View>
      {!!organization && (
        <View testID="hours-summary">
          <View
            style={styles.summaryContent}
            onLayout={(e) => setSummaryHeight(e.nativeEvent.layout.height)}
          >
            <Enter index={1}>
              <VText variant="sub">{t('at', { name: organization.name })}</VText>
            </Enter>
            <Enter index={2} style={styles.stats}>
              {stats.map((stat) => (
                <View
                  key={stat.key}
                  style={[styles.stat, shadows.card, { backgroundColor: STAT_TONE[stat.key].bg }]}
                  testID={`hours-total-${stat.key}`}
                >
                  <VText style={[styles.statValue, { color: STAT_TONE[stat.key].fg }]}>
                    {`${stat.value || 0}h`}
                  </VText>
                  <VText variant="cap">{stat.label}</VText>
                </View>
              ))}
            </Enter>
          </View>
        </View>
      )}
      {!!organization && (
        <View
          style={styles.pinnedStatus}
          onLayout={(e) => setStatusHeight(e.nativeEvent.layout.height)}
        >
          <Enter index={3}>
            <SegmentedControl
              options={[
                { key: ActivityLogStatus.PENDING, label: `${t('tabs.pending')}` },
                { key: ActivityLogStatus.APPROVED, label: `${t('tabs.approved')}` },
                { key: ActivityLogStatus.REJECTED, label: `${t('tabs.rejected')}` },
              ]}
              value={status}
              onChange={setStatus}
              testID="hours-status"
            />
          </Enter>
        </View>
      )}
    </Animated.View>
  );

  const renderEmpty = () => {
    // no active organization: no hours to show, and nothing was asked from the API
    if (!organization) {
      return (
        <EmptyState
          title={`${t('volunteer:no_org_added')}`}
          description={`${t('volunteer:no_org_description')}`}
          actionLabel={`${t('volunteer:join_organization')}`}
          onAction={() => navigation.navigate('search')}
          testID="hours-no-organization"
        />
      );
    }
    const canAdd = status === ActivityLogStatus.PENDING && !inactive;
    if (isFetching && !isRefetching && !items.length) {
      return <ActivityLogSkeletonItem />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          error
          actionLabel={`${t('events:retry')}`}
          onAction={reload}
        />
      );
    }
    return (
      <EmptyState
        title={`${t(`empty.${status}.title`)}`}
        description={`${t(`empty.${status}.description`)}`}
        actionLabel={canAdd ? `${t('add')}` : undefined}
        onAction={canAdd ? onAdd : undefined}
        testID="hours-empty"
      />
    );
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Enter index={Math.min(index, 6)} style={groupedItem(index, items.length)}>
            <LogRow log={item} status={status} onPress={onOpen} />
          </Enter>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reload}
            progressViewOffset={headerHeight}
          />
        }
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerHeight, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="hours-list"
      />
      {header}

      <Sheet
        ref={profileSheet}
        title={`${t('error_modal.title')}`}
        subtitle={`${t('error_modal.description')}`}
        testID="hours-profile-sheet"
      >
        <VButton
          label={`${t('error_modal.action_btn_label')}`}
          onPress={() => {
            profileSheet.current?.dismiss();
            navigation.navigate('volunteer-profile');
          }}
        />
        <VButton
          variant="soft"
          label={`${t('general:back')}`}
          onPress={() => profileSheet.current?.dismiss()}
        />
      </Sheet>
      <StatusBarScrim />
    </View>
  );
};

export default ActivityLogs;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  pinnedTitle: { gap: 4 },
  pinnedStatus: { paddingTop: 4 },
  summaryContent: { paddingTop: 4, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  addButton: { minHeight: 40, flexShrink: 0 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 },
  stat: {
    flex: 1,
    borderRadius: radius.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  statValue: { fontFamily: fonts.title, fontSize: 22, lineHeight: 28, color: colors.ink },
  more: { paddingVertical: 20 },
});
