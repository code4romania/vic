import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EventType } from '../common/enums/event-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { colors, fonts, spacing } from '../common/theme/tokens';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { useEvent } from '../store/event/event.selector';
import useMyOrganizations from '../hooks/useMyOrganizations';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EmptyState, Enter, PressableScale, UnderlineTabs, VText } from '../components/ui';
import { EventCard, EventCardItem } from '../components/events/EventCard';
import { EventIcon } from '../components/events/EventIcons';
import { EventSearchModal } from '../components/events/EventSearchModal';
import {
  countActiveFilters,
  EMPTY_EVENT_FILTERS,
  EventFilters,
  toEventQueryFilters,
} from '../components/events/event-filters';
import EventSkeletonListItem from '../components/skeleton/event-skeleton-item';

const HEADER_HEIGHT = 150;

const tabIcon = (name: 'open' | 'going' | 'organizations') => (active: boolean) => (
  <EventIcon name={name} color={active ? colors.navy : colors.muted} />
);

/**
 * VIC 2.0 Evenimente (canvas board "Evenimente"): a search pill that opens the full-screen
 * search, category tabs with a sliding underline, and the list, which re-staggers whenever the
 * tab or the filters change. The header gets a shadow once the list scrolls under it.
 */
const Events = ({ navigation, route }: any) => {
  const { t } = useTranslation('events');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const { event } = useEvent();

  const [eventFilter, setEventFilter] = useState<EventType>(EventType.OPEN);
  const [filters, setFilters] = useState<EventFilters>(EMPTY_EVENT_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);

  // "Vezi evenimente" on an organization's page and "Vezi toate" on Acasă open this tab already
  // filtered; the params are consumed once, so the tab keeps working as usual afterwards.
  const requestedOrganizationId: string | undefined = route?.params?.organizationId;
  const requestedEventFilter: EventType | undefined = route?.params?.eventFilter;
  useEffect(() => {
    if (!requestedOrganizationId && !requestedEventFilter) {
      return;
    }
    if (requestedEventFilter) {
      setEventFilter(requestedEventFilter);
    }
    if (requestedOrganizationId) {
      setEventFilter(requestedEventFilter ?? EventType.OPEN);
      setFilters({ ...EMPTY_EVENT_FILTERS, organizationId: requestedOrganizationId });
    }
    navigation.setParams({ organizationId: undefined, eventFilter: undefined });
  }, [requestedOrganizationId, requestedEventFilter, navigation]);

  const scrollY = useSharedValue(0);
  const onScroll = useTabBarScroll(scrollY);

  const queryFilters = useMemo(() => toEventQueryFilters(filters), [filters]);
  const {
    data: events,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useEventsInfiniteQuery(OrderDirection.ASC, filters.search, eventFilter, queryFilters);

  // an RSVP from the event page changes what the tabs show
  const reload = useCallback(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    reload();
  }, [event, reload]);

  const items = useMemo(
    () => (events?.pages ?? []).flatMap((page) => page.items) as EventCardItem[],
    [events],
  );
  const activeFilters = countActiveFilters(filters);
  const organizations = useMyOrganizations();
  const summary = useMemo(() => {
    const parts = [
      filters.search ? `„${filters.search}”` : null,
      filters.when !== 'any' ? t(`search.when_options.${filters.when}`) : null,
      organizations.find((org) => org.id === filters.organizationId)?.name ?? null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : t('search.summary_any');
  }, [filters, organizations, t]);

  // restagger the list when the tab or the filters change
  const listKey = `${eventFilter}:${JSON.stringify(filters)}`;
  const isInitialLoading = isFetching && !isFetchingNextPage && !isRefetching && !items.length;

  // measured (the tallest it gets: the pill shrinks while scrolling), so the first card always
  // starts below the header whatever the text size
  const [measuredHeader, setMeasuredHeader] = useState(0);
  const headerHeight = measuredHeader || insets.top + HEADER_HEIGHT;
  const headerShadow = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 12], [0, 0.06], Extrapolation.CLAMP),
    borderBottomColor: scrollY.value > 4 ? colors.line : 'transparent',
  }));
  const pillStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 40], [56, 46], Extrapolation.CLAMP),
  }));
  const pillSummaryStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [1, 0], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, 24], [16, 0], Extrapolation.CLAMP),
  }));

  const onOpenEvent = (eventId: string) => navigation.navigate('event', { eventId });

  const renderItem = ({ item, index }: { item: EventCardItem; index: number }) => (
    <Enter index={index}>
      <EventCard
        event={item}
        onPress={onOpenEvent}
        going={eventFilter === EventType.GOING}
        variant="card"
      />
    </Enter>
  );

  const renderEmpty = () => {
    if (isInitialLoading) {
      return <EventSkeletonListItem />;
    }
    if (error) {
      return (
        <EmptyState
          title={`${t('errors.generic')}`}
          actionLabel={`${t('retry')}`}
          onAction={reload}
          testID="events-error"
        />
      );
    }
    const filtered = activeFilters > 0 || !!filters.search;
    return (
      <EmptyState
        icon={<EventIcon name="calendar" size={36} color={colors.subtle} />}
        title={`${t(filtered ? 'empty.filtered_title' : `empty.${eventFilter.toLowerCase()}_title`)}`}
        description={`${t(
          filtered
            ? 'empty.filtered_description'
            : `empty.${eventFilter.toLowerCase()}_description`,
        )}`}
        actionLabel={filtered ? `${t('search.clear')}` : undefined}
        onAction={filtered ? () => setFilters(EMPTY_EVENT_FILTERS) : undefined}
        testID="events-empty"
      />
    );
  };

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        key={listKey}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.navy} style={styles.more} /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reload}
            progressViewOffset={headerHeight}
          />
        }
        contentContainerStyle={[
          styles.list,
          // room under the search bar and the tabs (Andrew, 9 Nov: the list sat too close to them)
          { paddingTop: headerHeight + 16, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="events-list"
      />

      <Animated.View
        style={[styles.top, { paddingTop: insets.top + 12 }, headerShadow]}
        onLayout={(e) => {
          const height = Math.round(e.nativeEvent.layout.height);
          setMeasuredHeader((current) => Math.max(current, height));
        }}
      >
        <View style={styles.searchRow}>
          <Animated.View style={[styles.pillWrap, pillStyle]}>
            <PressableScale
              onPress={() => setSearchOpen(true)}
              style={styles.pill}
              accessibilityLabel={`${t('search.title')}. ${summary}`}
              testID="events-search-pill"
            >
              <EventIcon name="search" size={20} />
              <View style={styles.pillText}>
                <VText variant="label" style={styles.pillTitle}>
                  {t('search.title')}
                </VText>
                <Animated.View style={pillSummaryStyle}>
                  <VText variant="cap" numberOfLines={1}>
                    {summary}
                  </VText>
                </Animated.View>
              </View>
            </PressableScale>
          </Animated.View>
          <PressableScale
            onPress={() => setSearchOpen(true)}
            style={styles.filterButton}
            accessibilityLabel={`${t('search.filters')}${
              activeFilters ? `, ${activeFilters}` : ''
            }`}
            testID="events-filter-button"
          >
            <EventIcon name="filters" size={18} />
            {activeFilters > 0 && (
              <View style={styles.filterCount} testID="events-filter-count">
                <VText variant="cap" color={colors.white} style={styles.filterCountText}>
                  {activeFilters}
                </VText>
              </View>
            )}
          </PressableScale>
        </View>
        <UnderlineTabs<EventType>
          value={eventFilter}
          onChange={setEventFilter}
          testID="events-tabs"
          tabs={[
            {
              key: EventType.OPEN,
              label: t('tabs.open'),
              icon: tabIcon('open'),
            },
            {
              key: EventType.GOING,
              label: t('tabs.going'),
              icon: tabIcon('going'),
            },
            {
              key: EventType.ORGANIZATIONS,
              label: t('tabs.organizations'),
              icon: tabIcon('organizations'),
            },
          ]}
        />
      </Animated.View>

      <EventSearchModal
        visible={searchOpen}
        initialFilters={filters}
        organizations={organizations}
        eventFilter={eventFilter}
        onApply={(next) => {
          setFilters(next);
          setSearchOpen(false);
        }}
        onClose={() => setSearchOpen(false)}
      />
    </View>
  );
};

export default Events;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  more: { paddingVertical: 20 },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 4,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pillWrap: { flex: 1 },
  pill: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 20,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillText: { flex: 1 },
  pillTitle: { fontFamily: fonts.bold },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grab,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCount: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: { fontSize: 11, lineHeight: 13, fontFamily: fonts.bold },
});
