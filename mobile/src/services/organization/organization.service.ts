import { useInfiniteQuery } from 'react-query';
import { getOrganizations } from './organization.api';
import { OrderDirection } from '../../common/enums/order-direction.enum';

export const useOrganizations = (orderDirection: OrderDirection, search: string) => {
  return useInfiniteQuery(
    ['organizations', orderDirection, search],
    ({ pageParam }) => getOrganizations({ pageParam, orderDirection, search }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};
