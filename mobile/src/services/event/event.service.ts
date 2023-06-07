import { useInfiniteQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getEvents } from './event.api';

export const useEventsInfiniteQuery = (orderDirection: OrderDirection, search: string) => {
  return useInfiniteQuery(
    ['events', orderDirection, search],
    ({ pageParam }) => getEvents({ pageParam, orderDirection, search }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};
