import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { EventType } from '../common/enums/event-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { useEvent } from '../store/event/event.selector';
import useMyOrganizations from '../hooks/useMyOrganizations';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import {
  EmptyState,
  LargeTitleCompactBar,
  LargeTitleHeader,
  PressableScale,
} from '../components/ui';
import { AppText, SegmentedControl } from '../design/components';
import { FiltersIcon, SearchIcon } from '../design/icons';
import { fontScaleCap, palette } from '../design/tokens';
import { duration, easing, enter, MAX_STAGGER } from '../design/motion';
import { haptics } from '../design/haptics';
import { EventCard, EventCardItem } from '../components/events/EventCard';
import { EventSearchModal } from '../components/events/EventSearchModal';
import { EventFiltersSheet } from '../components/events/EventFiltersSheet';
import {
  countActiveFilters,
  EMPTY_EVENT_FILTERS,
  EventFilters,
  toEventQueryFilters,
} from '../components/events/event-filters';
import EventSkeletonListItem from '../components/skeleton/event-skeleton-item';

/** the old list fades up and out before the new one staggers in (handbook: swap-out) */
const SWAP_OUT_MS = 140;
/** the header takes the first three entrance steps (title, search row, segmented control) */
const HEADER_STEPS = 3;

/** One list item: enters with the stagger (first screenful only) and follows the swap-out. */
const ListItem = ({
  index,
  offset,
  out,
  reduced,
  children,
}: {
  index: number;
  offset: number;
  out: SharedValue<number>;
  reduced: boolean;
  children: ReactNode;
}) => {
  const swapStyle = useAnimatedStyle(() => ({
    opacity: 1 - out.value,
    transform: [{ translateY: reduced ? 0 : -6 * out.value }],
  }));
  return (
    <Animated.View
      entering={index < MAX_STAGGER ? enter(index + offset, reduced) : undefined}
      style={styles.item}
    >
      <Animated.View style={swapStyle}>{children}</Animated.View>
    </Animated.View>
  );
};

/**
 * Evenimente „Îndrăzneț”: a large title (the compact glass bar takes over after 48pt), a white
 * search field that opens the search (the active filters show as a yellow token), a navy filters
 * button that opens the filters sheet, the segmented control and the event cards. Changing the
 * segment fades the old list up and out (140 ms), then the new one staggers in.
 */
const Events = ({ navigation, route }: any) => {
  const { t } = useTranslation('events');
  const reduced = useReducedMotion();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const { event } = useEvent();

  // the segment shows the choice at once; the list follows after the swap-out
  const [selectedFilter, setSelectedFilter] = useState<EventType>(EventType.OPEN);
  const [eventFilter, setEventFilter] = useState<EventType>(EventType.OPEN);
  const [filters, setFilters] = useState<EventFilters>(EMPTY_EVENT_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const filtersRef = useRef<BottomSheetModal>(null);

  const listOut = useSharedValue(0);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(swapTimer.current), []);

  const showTab = useCallback(
    (next: EventType) => {
      clearTimeout(swapTimer.current);
      listOut.value = 0;
      setSelectedFilter(next);
      setEventFilter(next);
    },
    [listOut],
  );

  const onChangeTab = (next: EventType) => {
    setSelectedFilter(next);
    clearTimeout(swapTimer.current);
    const out = reduced ? duration.reduced : SWAP_OUT_MS;
    listOut.value = withTiming(1, { duration: out, easing: easing.exit });
    swapTimer.current = setTimeout(() => {
      listOut.value = 0;
      setEventFilter(next);
    }, out);
  };

  // "Vezi evenimente" on an organization's page and "Vezi toate" on Acasă open this tab already
  // filtered; the params are consumed once, so the tab keeps working as usual afterwards.
  const requestedOrganizationId: string | undefined = route?.params?.organizationId;
  const requestedEventFilter: EventType | undefined = route?.params?.eventFilter;
  useEffect(() => {
    if (!requestedOrganizationId && !requestedEventFilter) {
      return;
    }
    if (requestedEventFilter) {
      showTab(requestedEventFilter);
    }
    if (requestedOrganizationId) {
      showTab(requestedEventFilter ?? EventType.OPEN);
      setFilters({ ...EMPTY_EVENT_FILTERS, organizationId: requestedOrganizationId });
    }
    navigation.setParams({ organizationId: undefined, eventFilter: undefined });
  }, [requestedOrganizationId, requestedEventFilter, navigation, showTab]);

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
  const total: number | undefined = events?.pages?.[0]?.meta?.totalItems;
  const activeFilters = countActiveFilters(filters);
  const organizations = useMyOrganizations();
  const summary = useMemo(() => {
    const parts = [
      filters.search ? `„${filters.search}”` : null,
      filters.when !== 'any' ? t(`search.when_options.${filters.when}`) : null,
      organizations.find((org) => org.id === filters.organizationId)?.name ?? null,
    ].filter(Boolean);
    return parts.join(' · ');
  }, [filters, organizations, t]);

  // a new tab or new filters remount the cards, so they stagger in again
  const listKey = `${eventFilter}:${JSON.stringify(filters)}`;
  const initialListKey = useRef<string | null>(listKey);
  if (initialListKey.current && listKey !== initialListKey.current) {
    initialListKey.current = null;
  }
  // on the first screen the cards follow the header's steps; after a swap they start at once
  const itemOffset = initialListKey.current ? HEADER_STEPS : 0;
  const isInitialLoading = isFetching && !isFetchingNextPage && !isRefetching && !items.length;
  // the count of the list on screen (the API gives no count for the other segments)
  const countFor = (key: EventType) =>
    key === eventFilter && key === selectedFilter && !isInitialLoading ? total : undefined;

  const onOpenEvent = (eventId: string) => {
    haptics.light();
    navigation.navigate('event', { eventId });
  };

  const openSearch = () => {
    haptics.light();
    setSearchOpen(true);
  };

  const renderItem = ({ item, index }: { item: EventCardItem; index: number }) => (
    <ListItem index={index} offset={itemOffset} out={listOut} reduced={reduced}>
      <EventCard
        event={item}
        onPress={onOpenEvent}
        going={eventFilter === EventType.GOING}
        variant="card"
      />
    </ListItem>
  );

  const renderEmpty = () => {
    let content: ReactNode;
    if (isInitialLoading) {
      content = <EventSkeletonListItem />;
    } else if (error) {
      content = (
        <EmptyState
          title={`${t('errors.generic')}`}
          error
          actionLabel={`${t('retry')}`}
          onAction={reload}
          testID="events-error"
        />
      );
    } else {
      const filtered = activeFilters > 0 || !!filters.search;
      content = (
        <EmptyState
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
    }
    return (
      <ListItem key={listKey} index={0} offset={itemOffset} out={listOut} reduced={reduced}>
        {content}
      </ListItem>
    );
  };

  const filtersLabel =
    activeFilters === 0
      ? `${t('search.filters')}`
      : activeFilters === 1
        ? `${t('search.filters_count_one')}`
        : `${t('search.filters_count', { n: activeFilters })}`;

  const header = (
    <View style={styles.header}>
      <Animated.View entering={enter(0, reduced)}>
        <LargeTitleHeader title={`${t('header')}`} scrollY={scrollY} compact={false} />
      </Animated.View>
      <Animated.View entering={enter(1, reduced)} style={styles.searchRow}>
        <PressableScale
          onPress={openSearch}
          style={styles.search}
          accessibilityLabel={summary ? `${t('search.title')}. ${summary}` : t('search.title')}
          testID="events-search-pill"
        >
          <SearchIcon size={22} color={palette.navy} />
          <View style={styles.searchText}>
            <AppText variant="bodyStrong" color={palette.ink2} numberOfLines={1}>
              {t('search.title')}
            </AppText>
            {!!summary && (
              <View style={styles.token}>
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCap.text}
                  style={styles.tokenText}
                >
                  {summary}
                </Text>
              </View>
            )}
          </View>
        </PressableScale>
        <PressableScale
          onPress={() => filtersRef.current?.present()}
          style={styles.filterButton}
          accessibilityLabel={filtersLabel}
          testID="events-filter-button"
        >
          <FiltersIcon size={22} color={palette.yellow} />
          {activeFilters > 0 && (
            <View style={styles.filterCount} testID="events-filter-count">
              <Text maxFontSizeMultiplier={1.15} style={styles.filterCountText}>
                {activeFilters}
              </Text>
            </View>
          )}
        </PressableScale>
      </Animated.View>
      <Animated.View entering={enter(2, reduced)} style={styles.segmented}>
        <SegmentedControl<EventType>
          value={selectedFilter}
          onChange={onChangeTab}
          testID="events-tabs"
          options={[
            { key: EventType.OPEN, label: t('tabs.open'), count: countFor(EventType.OPEN) },
            { key: EventType.GOING, label: t('tabs.going'), count: countFor(EventType.GOING) },
            {
              key: EventType.ORGANIZATIONS,
              label: t('tabs.organizations'),
              count: countFor(EventType.ORGANIZATIONS),
            },
          ]}
        />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => `${listKey}:${item.id}`}
        renderItem={renderItem}
        ListHeaderComponent={header}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={palette.navy} style={styles.more} /> : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={reload} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        testID="events-list"
      />
      <LargeTitleCompactBar title={`${t('header')}`} scrollY={scrollY} />

      <EventFiltersSheet
        ref={filtersRef}
        filters={filters}
        organizations={organizations}
        onChange={setFilters}
        count={isInitialLoading ? undefined : total}
        onClose={() => filtersRef.current?.dismiss()}
      />

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

const SEARCH_HEIGHT = 58;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.paper },
  list: { flexGrow: 1 },
  header: { paddingBottom: 4 },
  item: { paddingHorizontal: theme.space.gutter, marginBottom: 10 },
  more: { paddingVertical: 20 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.space.gutter,
  },
  search: {
    flex: 1,
    minHeight: SEARCH_HEIGHT,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchText: { flex: 1, alignItems: 'flex-start' },
  token: {
    maxWidth: '100%',
    marginTop: 2,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 1,
    backgroundColor: theme.colors.yellow,
  },
  tokenText: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.navy,
  },
  filterButton: {
    width: SEARCH_HEIGHT,
    height: SEARCH_HEIGHT,
    borderRadius: 22,
    backgroundColor: theme.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.yellow,
    // the paper ring around the badge
    borderWidth: 2,
    borderColor: theme.colors.paper,
  },
  filterCountText: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 11,
    lineHeight: 13,
    color: theme.colors.navy,
    fontVariant: ['tabular-nums'],
  },
  segmented: { paddingHorizontal: theme.space.gutter, marginTop: 14, marginBottom: 14 },
}));
