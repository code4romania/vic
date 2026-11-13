import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import Toast from 'react-native-toast-message';
import { queryKeys } from '../services/query-keys';
import {
  isCandidateVolunteer,
  isInactiveVolunteer,
  IOrganizationVolunteer,
} from '../common/interfaces/organization-list-item.interface';
import {
  useActivityLogsCounters,
  useActivityLogsInfiniteQuery,
} from '../services/activity-log/activity-log.service';
import { useActivateOrganization } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import { IActivityLog } from '../common/interfaces/activity-log.interface';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { isTabRoute } from '../routes/tab-routes';
import { useTabBarAccessory, useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { HIGHLIGHT_MS, LogRow } from '../components/hours/LogRow';
import { toHours } from '../common/utils/hours';
import { HoursSummary } from '../components/hours/HoursSummary';
import { AddHoursSheet, AddHoursSheetHandle } from '../components/hours/AddHoursSheet';
import { OrganizationChip, OrganizationSwitchSheet } from '../components/hours/OrganizationChip';
import ActivityLogSkeletonItem from '../components/skeleton/activity-log-skeleton-item';
import { EmptyState, LargeTitleHeader, StatusBarScrim } from '../components/ui';
import { palette } from '../design/tokens';
import { enter } from '../design/motion';
import { ChevronLeftIcon, ICON_STROKE, PlusIcon } from '../design/icons';
import { AppText } from '../design/components/Text';
import { Button } from '../design/components/Button';
import { SegmentedControl } from '../design/components/SegmentedControl';
import { Sheet, SheetBackdropScale, useSheetBackdropProgress } from '../design/components/Sheet';

// newest first, like the canvas
const ORDER = OrderDirection.DESC;
// prototype scroll: from 10pt to 80pt the large title shrinks to 88% (from its bottom-left corner)
// and fades to 10%; the compact bar comes in at 48pt (LargeTitleHeader)
const TITLE_FADE_FROM = 10;
const TITLE_FADE_TO = 80;
// after „Trimis spre aprobare” closes: the new row glows and the toast comes this much later
const AFTER_CLOSE_MS = 420;

/**
 * Ore „Îndrăzneț” (prototype `#s-hours`): the active organization as a navy chip (switch on tap),
 * the large title, a white card with the impact hexagon and the hours per status, the segmented
 * control (În așteptare / Aprobate / Respinse) and the entries. „Adaugă ore” sits beside the tab
 * bar and opens a form sheet; the screen scales back behind it. Without a volunteer profile a
 * sheet sends the volunteer to fill it in.
 */
const ActivityLogs = ({ navigation, route }: any) => {
  const { t } = useTranslation('activity_logs');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  const reduced = useReducedMotion();
  useFocusedStatusBarStyle('dark');
  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);
  const profileSheet = useRef<BottomSheetModal>(null);
  const organizationSheet = useRef<BottomSheetModal>(null);
  const addSheet = useRef<AddHoursSheetHandle>(null);
  const { animatedPosition, progress } = useSheetBackdropProgress();
  const asTab = isTabRoute(route);

  const [status, setStatus] = useState<ActivityLogStatus>(ActivityLogStatus.PENDING);
  const [pendingCount, setPendingCount] = useState<number | undefined>(undefined);
  // the entry just sent (highlighted once) and a counter that refills the hexagon
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [refillKey, setRefillKey] = useState(0);
  // each focus counts the approved hours again from 0, with the hexagon refill
  const [focusKey, setFocusKey] = useState(0);
  const sentAt = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // the first list enters as one block (stagger step 4); after a segment change rows stagger from 0
  const [swapped, setSwapped] = useState(false);
  const { approvedHours, rejectedHours, pendingHours } = useActivityLogs();
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const inactive = isInactiveVolunteer(organization);
  const canAdd = !!organization && !inactive;
  const queryClient = useQueryClient();
  const { activate } = useActivateOrganization();

  // the organizations the volunteer can switch to here (a candidate only sees its page)
  const organizations = useMemo(
    () => (userProfile?.myOrganizations ?? []).filter((item) => !isCandidateVolunteer(item)),
    [userProfile?.myOrganizations],
  );
  const canSwitch = organizations.some((item) => item.id !== organization?.id);

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
      setFocusKey((key) => key + 1);
    }, [queryClient, reload]),
  );

  useEffect(
    () => () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    },
    [],
  );

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.items) as IActivityLogItem[],
    [data],
  );

  // the count on „În așteptare” comes from the pending list (the first one shown)
  const totalItems = (data?.pages?.[0] as any)?.meta?.totalItems;
  useEffect(() => {
    if (status === ActivityLogStatus.PENDING && organization && typeof totalItems === 'number') {
      setPendingCount(totalItems);
    }
  }, [status, organization, totalItems]);

  // the highlight plays once the new entry is in the reloaded list, then it is cleared
  const highlightShown = !!highlightId && items.some((item) => item.id === highlightId);
  useEffect(() => {
    if (!highlightShown) {
      return;
    }
    const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS + 200);
    return () => clearTimeout(timer);
  }, [highlightShown]);

  const hasProfile = !!organization?.volunteerProfileId;
  const onAdd = useCallback(() => {
    if (!hasProfile) {
      profileSheet.current?.present();
      return;
    }
    addSheet.current?.present();
  }, [hasProfile]);

  // after „Trimis spre aprobare”: back to the pending entries, the new one glows, the hexagon refills
  const onSent = useCallback(
    (log: IActivityLog) => {
      sentAt.current = Date.now();
      setStatus(ActivityLogStatus.PENDING);
      setHighlightId(log?.id ?? null);
      setRefillKey((key) => key + 1);
      reload();
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      toastTimer.current = setTimeout(() => {
        toastTimer.current = null;
        Toast.show({ type: 'success', text1: `${t('sent_toast', { n: log?.hours ?? '' })}` });
      }, AFTER_CLOSE_MS);
    },
    [reload, t],
  );

  const onStatus = useCallback((next: ActivityLogStatus) => {
    setSwapped(true);
    setStatus(next);
  }, []);

  const accessory = useMemo(
    () =>
      asTab && canAdd
        ? { label: `${t('add')}`, icon: PlusIcon, onPress: onAdd, testID: 'hours-add' }
        : null,
    [asTab, canAdd, onAdd, t],
  );
  useTabBarAccessory(accessory);

  const onOpen = (activityLogId: string) => navigation.navigate('activity-log', { activityLogId });

  const onSwitch = async (next: IOrganizationVolunteer) => {
    organizationSheet.current?.dismiss();
    try {
      await activate(next);
    } catch (switchError: any) {
      Toast.show({
        type: 'error',
        text1: `${InternalErrors.ORGANIZATION_ERRORS.getError(
          switchError?.response?.data?.code_error,
        )}`,
      });
    }
  };

  const titleStyle = useAnimatedStyle(() => {
    const p = interpolate(
      scrollY.value,
      [TITLE_FADE_FROM, TITLE_FADE_TO],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: 1 - p * 0.9, transform: [{ scale: 1 - p * 0.12 }] };
  });

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
      {!!organization && (
        <Animated.View entering={enter(0, reduced)}>
          <OrganizationChip
            name={organization.name}
            onPress={canSwitch ? () => organizationSheet.current?.present() : undefined}
            testID="hours-organization"
          />
        </Animated.View>
      )}
      {/* Opened from the volunteer page: the back button and „+ Adaugă” join the title row (no tab
          bar there to hold the action). */}
      <Animated.View
        entering={enter(1, reduced)}
        testID="hours-title-row"
        style={[styles.titleRow, organization ? styles.titleAfterChip : null]}
      >
        {!asTab && (
          <Pressable
            onPress={navigation.goBack}
            style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`${t('general:back')}`}
            hitSlop={2}
            testID="hours-back"
          >
            <ChevronLeftIcon size={22} color={palette.navy} strokeWidth={ICON_STROKE + 0.4} />
          </Pressable>
        )}
        <Animated.View style={[styles.title, titleStyle]}>
          <AppText variant={asTab ? 'largeTitle' : 'title'} accessibilityRole="header">
            {t('title')}
          </AppText>
        </Animated.View>
        {!asTab && canAdd && (
          <Button
            size="S"
            label={`+ ${t('add_short')}`}
            accessibilityLabel={`${t('add')}`}
            onPress={onAdd}
            hitSlop={5}
            testID="hours-add"
          />
        )}
      </Animated.View>
      {!!organization && (
        <Animated.View entering={enter(2, reduced)} style={styles.summary}>
          <HoursSummary
            approved={toHours(approvedHours)}
            pending={toHours(pendingHours)}
            rejected={toHours(rejectedHours)}
            refillKey={refillKey}
            replay={`${focusKey}-${refillKey}`}
          />
        </Animated.View>
      )}
      {!!organization && (
        <Animated.View entering={enter(3, reduced)} style={styles.segment}>
          <SegmentedControl
            options={[
              {
                key: ActivityLogStatus.PENDING,
                label: `${t('tabs.pending')}`,
                count: pendingCount,
              },
              { key: ActivityLogStatus.APPROVED, label: `${t('tabs.approved')}` },
              { key: ActivityLogStatus.REJECTED, label: `${t('tabs.rejected')}` },
            ]}
            value={status}
            onChange={onStatus}
            testID="hours-status"
          />
        </Animated.View>
      )}
    </View>
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
    // on the tab the add action already sits in the tab bar; the empty state repeats it only off-tab
    const emptyAdd = status === ActivityLogStatus.PENDING && canAdd && !asTab;
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
        actionLabel={emptyAdd ? `${t('add')}` : undefined}
        onAction={emptyAdd ? onAdd : undefined}
        testID="hours-empty"
      />
    );
  };

  return (
    <View style={styles.root}>
      <SheetBackdropScale progress={progress} style={styles.screen}>
        <Animated.FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <Animated.View entering={enter(swapped ? index : 4, reduced)} style={styles.item}>
              <LogRow
                log={item}
                status={status}
                onPress={onOpen}
                highlight={item.id === highlightId}
                highlightDelay={AFTER_CLOSE_MS - (Date.now() - sentAt.current)}
              />
            </Animated.View>
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={palette.navy} style={styles.more} />
            ) : null
          }
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={reload}
              progressViewOffset={insets.top}
            />
          }
          contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
          showsVerticalScrollIndicator={false}
          testID="hours-list"
        />
        <StatusBarScrim color={palette.paper} />
        <LargeTitleHeader title={`${t('title')}`} scrollY={scrollY} compactOnly />
      </SheetBackdropScale>

      <AddHoursSheet ref={addSheet} animatedPosition={animatedPosition} onSent={onSent} />

      <OrganizationSwitchSheet
        ref={organizationSheet}
        organizations={organizations}
        activeId={organization?.id}
        onSelect={onSwitch}
      />

      <Sheet
        ref={profileSheet}
        title={`${t('error_modal.title')}`}
        subtitle={`${t('error_modal.description')}`}
        closeLabel={`${t('general:close')}`}
        testID="hours-profile-sheet"
      >
        <Button
          label={`${t('error_modal.action_btn_label')}`}
          full
          onPress={() => {
            profileSheet.current?.dismiss();
            navigation.navigate('volunteer-profile');
          }}
        />
        <Button
          variant="outline"
          label={`${t('general:back')}`}
          full
          onPress={() => profileSheet.current?.dismiss()}
        />
      </Sheet>
    </View>
  );
};

export default ActivityLogs;

const styles = StyleSheet.create((theme) => ({
  // behind the screen while it scales back under a sheet
  root: { flex: 1, backgroundColor: theme.colors.black },
  screen: { backgroundColor: theme.colors.paper },
  list: { paddingHorizontal: theme.space.gutter, flexGrow: 1 },
  // prototype `#s-hours`: chip, 10, title, 16, card, 14, segmented, 14, entries
  header: { paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleAfterChip: { marginTop: 10 },
  summary: { marginTop: 16 },
  segment: { marginTop: 14 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { transform: [{ scale: 0.94 }] },
  title: { flex: 1, transformOrigin: 'left bottom' },
  item: { marginBottom: 10 },
  more: { paddingVertical: 20 },
}));
