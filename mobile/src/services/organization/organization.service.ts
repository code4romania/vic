import { useInfiniteQuery } from 'react-query';
import { getOrganizations } from './organization.api';

export const useOrganizations = () => {
  return useInfiniteQuery(['organizations'], ({ pageParam }) => getOrganizations({ pageParam }), {
    getNextPageParam: (lastPage) => {
      return lastPage?.meta.totalPages > lastPage?.meta.currentPage
        ? lastPage?.meta.currentPage + 1
        : undefined;
    },
  });
};
