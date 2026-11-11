import { useInfiniteQuery } from 'react-query';
import { getContractsHistory } from './contract.api';
import { queryKeys, useRefetchWhen } from '../query-keys';

// #486: every contract the NGO uploaded for the volunteer: signed, pending or expired
// Without an active organization (no volunteerId) nothing is asked (audit #7).
export const useContractHistoryInfiniteQuery = (volunteerId: string | undefined) => {
  const enabled = !!volunteerId;
  const query = useInfiniteQuery(
    queryKeys.contractHistory(volunteerId),
    ({ pageParam }) => getContractsHistory({ pageParam, volunteerId: volunteerId as string }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled,
    },
  );
  const refetch = useRefetchWhen(enabled, query.refetch);
  return { ...query, refetch };
};
