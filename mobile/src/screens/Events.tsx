import React, { useCallback, useEffect, useState } from 'react';
import i18n from '../common/config/i18n';
import Tabs from '../components/Tabs';
import EventItem from '../components/EventItem';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { useTranslation } from 'react-i18next';
import { OrderDirection } from '../common/enums/order-direction.enum';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { EventType } from '../common/enums/event-type.enum';
import { ISelectItem } from '../components/FormSelect';
import EventSkeletonListItem from '../components/skeleton/event-skeleton-item';
import { useEvent } from '../store/event/event.selector';
import { Screen } from '../components/Screen';
import { Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { StyleSheet } from 'react-native';
import { usePaddingTop } from '../hooks/usePaddingTop';

const EventsTabs: ISelectItem[] = [
  { key: EventType.GOING, label: i18n.t('events:tabs.going') },
  { key: EventType.ORGANIZATIONS, label: i18n.t('events:tabs.organizations') },
  { key: EventType.OPEN, label: i18n.t('events:tabs.open') },
];

const Events = ({ navigation }: any) => {
  const { t } = useTranslation('events');
  const paddingTop = usePaddingTop();
  // order direction filter
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  // search filter
  const [search, setSearch] = useState<string>('');
  // event tab filter
  const [eventFilter, setEventFilter] = useState<EventType>(EventType.GOING);
  const { event } = useEvent();

  // events query
  const {
    data: events,
    error: getEventsError,
    isFetching: isFetchingEvents,
    fetchNextPage,
    hasNextPage,
    refetch: reloadEvents,
    isFetchingNextPage,
  } = useEventsInfiniteQuery(orderDirection, search, eventFilter);

  // This will be triggered every time the organization state changes
  const refetchEvents = useCallback(() => {
    reloadEvents();
  }, [reloadEvents]);

  useEffect(() => {
    refetchEvents();
  }, [event, refetchEvents]);

  const onTabClick = (tabKey: string | number) => {
    setEventFilter(tabKey as EventType);
  };

  const onLoadMore = () => {
    if (!isFetchingEvents && hasNextPage) {
      fetchNextPage();
    }
  };

  const onEventListItemPress = (eventId: string) => {
    navigation.navigate('event', { eventId });
  };

  const onRenderEventListItem = ({ item }: { item: IEventListItem }) => (
    <EventItem event={item} onPress={onEventListItemPress} />
  );

  const onSort = () => {
    setOrderDirection(
      orderDirection === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC,
    );
  };

  return (
    <Screen preset="fixed" contentContainerStyle={[styles.childrenContainer, { paddingTop }]}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={styles.title}>
        {`${t('header')}`}
      </Text>
      <Tabs tabs={EventsTabs} onPress={onTabClick} />
      <SearchWithOrderAndFilters
        placeholder={t('search.placeholder')}
        onChange={setSearch}
        onSort={onSort}
      />
      <InfiniteListLayout<IEventListItem>
        pages={events?.pages}
        renderItem={onRenderEventListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingEvents && !isFetchingNextPage}
        refetch={reloadEvents}
        loadingLayout={<EventSkeletonListItem />}
        errorMessage={getEventsError ? `${t('errors.generic')}` : ''}
      />
    </Screen>
  );
};

export default Events;

const styles = StyleSheet.create({
  childrenContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  title: { paddingLeft: 8, marginBottom: 16 },
});
