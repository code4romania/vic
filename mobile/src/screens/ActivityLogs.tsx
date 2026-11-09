import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
 * VIC 2.0 Ore (canvas boards "Ore" and "OraDetaliu"): large title with the organization, the hours
 * per status, a segmented control (În așteptare / Aprobate / Refuzate) and the entries. "+ Adaugă
 * ore" needs a volunteer profile; without one a sheet sends the volunteer to fill it in.
 */
const ActivityLogs = ({ navigation, route }: any) => {
  const { t } = useTranslation('activity_logs');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const onScroll = useTabBarScroll();
  const profileSheet = useRef<BottomSheetModal>(null);

  const [status, setStatus] = useState<ActivityLogStatus>(ActivityLogStatus.PENDING);
  const { approvedHours, rejectedHours, pendingHours, activityLog } = useActivityLogs();
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: reloadActivityLogs,
    isRefetching,
  } = useActivityLogsInfiniteQuery(ORDER, '', status);

  const { refetch: reloadCounters } = useActivityLogsCounters(
    status,
    organization?.volunteerId as string,
  );

  const reload = useCallback(() => {
    reloadActivityLogs();
    reloadCounters();
  }, [reloadActivityLogs, reloadCounters]);

  // adding, editing or deleting an entry stores it; reload the list and the totals then
  useEffect(() => {
    if (activityLog) {
      reload();
    }
  }, [activityLog, reload]);

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

  const onOpen = (activityLogId: string) =>
    navigation.navigate('activity-log', {
      activityLogId,
      orderDirection: ORDER,
      search: '',
      status,
      volunteerId: organization?.volunteerId,
    });

  const stats = [
    { key: 'approved', value: approvedHours, label: t('totals.approved') },
    { key: 'pending', value: pendingHours, label: t('totals.pending') },
    { key: 'rejected', value: rejectedHours, label: t('totals.rejected') },
  ];

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {isTabRoute(route) ? (
          <View />
        ) : (
          <PressableScale
            onPress={navigation.goBack}
            style={[styles.back, shadows.back]}
            accessibilityLabel={`${t('general:back')}`}
            testID="hours-back"
          >
            <EventIcon name="back" size={20} />
          </PressableScale>
        )}
        <VButton
          size="small"
          variant="soft"
          label={`+ ${t('add')}`}
          onPress={onAdd}
          testID="hours-add"
        />
      </View>
      <Enter>
        <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
          {t('title')}
        </VText>
      </Enter>
      {!!organization && (
        <Enter index={1}>
          <VText variant="sub">{t('at', { name: organization.name })}</VText>
        </Enter>
      )}
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
  );

  const renderEmpty = () => {
    if (isFetching && !isRefetching && !items.length) {
      return <ActivityLogSkeletonItem />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          actionLabel={`${t('events:retry')}`}
          onAction={reload}
        />
      );
    }
    return (
      <EmptyState
        title={`${t(`empty.${status}.title`)}`}
        description={`${t(`empty.${status}.description`)}`}
        actionLabel={status === ActivityLogStatus.PENDING ? `${t('add')}` : undefined}
        onAction={status === ActivityLogStatus.PENDING ? onAdd : undefined}
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
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={reload} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 12, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="hours-list"
      />

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
  header: { paddingBottom: 6, gap: 4 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 },
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
