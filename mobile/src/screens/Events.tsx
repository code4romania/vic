import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import { EventsTabs } from '../common/constants/events-tabs';
import Tabs from '../components/Tabs';
import EventItem from '../components/EventItem';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { useTranslation } from 'react-i18next';
import { OrderDirection } from '../common/enums/order-direction.enum';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IEventListItem } from '../common/interfaces/event-list-item.interface';
import { useEventsInfiniteQuery } from '../services/event/event.service';
import { JSONStringifyError } from '../common/utils/utils';
import { Divider } from '@ui-kitten/components';

const Events = () => {
  const { t } = useTranslation('events');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  const [search, setSearch] = useState<string>('');
  console.log('Events');

  // events query
  const {
    data: events,
    error: getEventsError,
    isFetching: isFetchingEvents,
    fetchNextPage,
    hasNextPage,
    refetch: reloadEvents,
  } = useEventsInfiniteQuery(orderDirection, search);

  const onTabClick = (tabKey: string | number) => {
    console.log(tabKey);
  };

  const onLoadMore = () => {
    if (!isFetchingEvents && hasNextPage) {
      fetchNextPage();
    }
  };

  const onRenderEventListItem = ({ item }: { item: IEventListItem }) => <EventItem event={item} />;

  const onSort = () => {
    setOrderDirection(
      orderDirection === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC,
    );
  };

  return (
    <PageLayout title={i18n.t('tabs:events')}>
      <Tabs tabs={EventsTabs} onPress={onTabClick}>
        <>
          <SearchWithOrderAndFilters
            placeholder={t('search.placeholder')}
            onChange={setSearch}
            onSort={onSort}
            onFilter={() => console.log('filter')}
          />
          <InfiniteListLayout<IEventListItem>
            pages={events?.pages}
            renderItem={onRenderEventListItem}
            loadMore={onLoadMore}
            isLoading={isFetchingEvents}
            refetch={reloadEvents}
            errorMessage={
              getEventsError
                ? `${JSONStringifyError(getEventsError as Error)}`
                : // : `${t('errors.generic')}`
                  ''
            }
          />
        </>
      </Tabs>
    </PageLayout>
  );
};

export default Events;
