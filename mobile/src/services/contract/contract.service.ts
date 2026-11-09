import { useInfiniteQuery } from 'react-query';
import { getContractsHistory } from './contract.api';

// #486: every contract the NGO uploaded for the volunteer: signed, pending or expired
export const useContractHistoryInfiniteQuery = (volunteerId: string) => {
  return useInfiniteQuery(
    ['contract-history', volunteerId],
    ({ pageParam }) => getContractsHistory({ pageParam, volunteerId }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled: !!volunteerId,
    },
  );
};
