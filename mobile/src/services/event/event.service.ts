import { useInfiniteQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getEvents } from './event.api';
import { EventType } from '../../common/enums/event-type.enum';

export const useEventsInfiniteQuery = (
  orderDirection: OrderDirection,
  search: string,
  eventFilter: EventType,
) => {
  return useInfiniteQuery(
    ['events', orderDirection, search, eventFilter],
    ({ pageParam }) => getEvents({ pageParam, orderDirection, search, eventFilter }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};
