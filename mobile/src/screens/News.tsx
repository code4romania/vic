import React, { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNewsInfiniteQuery } from '../services/news/news.service';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';
import { NewsType } from '../common/enums/news-type.enum';
import { TrackedEventName } from '../common/enums/tracked-event-name.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { INewsItem } from '../common/interfaces/news-item.interface';
import { colors, shadows, spacing, StatusTone } from '../common/theme/tokens';
import useStore from '../store/store';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { EventIcon, EventIconName } from '../components/events/EventIcons';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';
import {
  Avatar,
  EmptyState,
  Enter,
  groupedItem,
  PressableScale,
  SegmentedControl,
  StatusBarScrim,
  VText,
} from '../components/ui';

type NewsLine = { start: string; organization?: string; end?: string };

const STATUS_ICON: Record<'ok' | 'no' | 'accent', { icon: EventIconName; tone: StatusTone }> = {
  ok: { icon: 'check', tone: 'ok' },
  no: { icon: 'close', tone: 'no' },
  accent: { icon: 'open', tone: 'accent' },
};

/**
 * VIC 2.0 Noutăți (canvas board "Noutăți"): what changed for the volunteer, by kind (hours, documents,
 * organizations). Tapping an update opens it and makes its organization active first.
 */
const News = ({ navigation, route }: any) => {
  const { t } = useTranslation('news');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const [type, setType] = useState<NewsType>(route.params?.type ?? NewsType.LOGGED_HOURS);

  const { mutate: switchOrganization } = useSwitchOrganizationMutation();
  const { setActiveOrganization } = useStore();
  const { userProfile } = useUserProfile();

  const {
    data,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isRefetching,
  } = useNewsInfiniteQuery(type);

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((page: any) => page.items) as INewsItem[],
    [data],
  );

  const describe = (item: INewsItem): { line: NewsLine; kind: 'ok' | 'no' | 'accent' } | null => {
    switch (item.eventName) {
      case TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS:
        if (item.newStatus === ActivityLogStatus.APPROVED) {
          return { kind: 'ok', line: { start: `${t('item.logs.approved')}` } };
        }
        if (item.newStatus === ActivityLogStatus.REJECTED) {
          return { kind: 'no', line: { start: `${t('item.logs.rejected')}` } };
        }
        return null;
      case TrackedEventName.CREATE_CONTRACT:
        return {
          kind: 'accent',
          line: {
            start: '',
            organization: item.organizationName,
            end: `${t('item.documents.new')}`,
          },
        };
      case TrackedEventName.APPROVE_CONTRACT:
        return {
          kind: 'ok',
          line: {
            start: `${t('item.documents.approved_start')}`,
            organization: item.organizationName,
            end: `${t('item.documents.approved_end')}`,
          },
        };
      case TrackedEventName.REJECT_CONTRACT:
        return {
          kind: 'no',
          line: {
            start: `${t('item.documents.rejected_start')}`,
            organization: item.organizationName,
            end: `${t('item.documents.rejected_end')}`,
          },
        };
      case TrackedEventName.APPROVE_ACCESS_REQUEST:
        return {
          kind: 'ok',
          line: {
            start: `${t('item.organization.request')}`,
            organization: item.organizationName,
            end: `${t('item.organization.approved')}`,
          },
        };
      case TrackedEventName.REJECT_ACCESS_REQUEST:
        return {
          kind: 'no',
          line: {
            start: `${t('item.organization.request')}`,
            organization: item.organizationName,
            end: `${t('item.organization.rejected')}`,
          },
        };
      default:
        return null;
    }
  };

  const onPress = (item: INewsItem) => {
    // the update belongs to an organization: make it the active one first
    const organization = userProfile?.myOrganizations?.find(
      (org) => org.id === item.organizationId,
    );
    if (item.organizationId && userProfile?.activeOrganization?.id !== item.organizationId) {
      if (organization) {
        setActiveOrganization(organization);
      }
      switchOrganization({ organizationId: item.organizationId });
    }

    switch (item.eventName) {
      case TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS:
        navigation.navigate('activity-log', { activityLogId: item.activityLogId });
        return;
      case TrackedEventName.REJECT_CONTRACT:
      case TrackedEventName.CREATE_CONTRACT:
      case TrackedEventName.APPROVE_CONTRACT:
        navigation.navigate(
          'documents',
          organization?.volunteerId ? { volunteerId: organization.volunteerId } : {},
        );
        return;
      case TrackedEventName.REJECT_ACCESS_REQUEST:
        navigation.navigate('rejected-request', { accessRequestId: item.accessRequestId });
        return;
      default:
        navigation.navigate('organization-profile', { organizationId: item.organizationId });
    }
  };

  const renderItem = ({ item, index }: { item: INewsItem; index: number }) => {
    const described = describe(item);
    if (!described) {
      return null;
    }
    const status = STATUS_ICON[described.kind];
    const { line } = described;
    return (
      <Enter index={Math.min(index, 6)} style={groupedItem(index, items.length)}>
        <PressableScale
          onPress={() => onPress(item)}
          pressedScale={0.985}
          style={styles.row}
          testID={`news-row-${item.id}`}
        >
          <View>
            <Avatar
              name={item.organizationName || '?'}
              uri={item.organizationLogo}
              size={44}
              shape="rounded"
            />
            <View style={[styles.badge, { backgroundColor: colors.status[status.tone].bg }]}>
              <EventIcon name={status.icon} size={12} color={colors.status[status.tone].fg} />
            </View>
          </View>
          <VText variant="body" style={styles.text} numberOfLines={3}>
            {line.start ? `${line.start} ` : ''}
            {!!line.organization && <VText variant="bodyStrong">{line.organization}</VText>}
            {line.end ? ` ${line.end}` : ''}
          </VText>
        </PressableScale>
      </Enter>
    );
  };

  const renderEmpty = () => {
    if (isFetching && !isRefetching && !items.length) {
      return <NewsItemSkeleton />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          actionLabel={`${t('events:retry')}`}
          onAction={() => refetch()}
        />
      );
    }
    return <EmptyState title={`${t('empty')}`} testID="news-empty" />;
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <PressableScale
              onPress={navigation.goBack}
              style={[styles.back, shadows.back]}
              accessibilityLabel={`${t('general:back')}`}
              testID="news-back"
            >
              <EventIcon name="back" size={20} />
            </PressableScale>
            <Enter>
              <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
                {t('title')}
              </VText>
            </Enter>
            <Enter index={1}>
              <SegmentedControl
                options={[
                  { key: NewsType.LOGGED_HOURS, label: `${t('tabs.logs')}` },
                  { key: NewsType.CONTRACTS, label: `${t('tabs.documents')}` },
                  { key: NewsType.ORGANIZATIONS, label: `${t('tabs.organizations')}` },
                ]}
                value={type}
                onChange={setType}
                testID="news-type"
              />
            </Enter>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        testID="news"
      />
      <StatusBarScrim />
    </View>
  );
};

export default News;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  header: { paddingBottom: 8, gap: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  more: { paddingVertical: 20 },
});
