import { useCallback } from 'react';
import { InfiniteData, useInfiniteQuery, useQueryClient } from 'react-query';
import { getContractsHistory } from './contract.api';
import { queryKeys, useRefetchWhen } from '../query-keys';

// #486: every contract the NGO uploaded for the volunteer: signed, pending or expired
// Without an active organization (no volunteerId) nothing is asked (audit #7).
export const useContractHistoryInfiniteQuery = (volunteerId: string | undefined) => {
  const queryClient = useQueryClient();
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
  const reloadFirstPage = useCallback(async () => {
    if (!enabled) {
      return undefined;
    }
    const key = queryKeys.contractHistory(volunteerId);
    // A next batch still loading would land back in the trimmed cache: cancel it first.
    await queryClient.cancelQueries(key);
    // Drop later pages so refresh only requests the first batch.
    queryClient.setQueryData<
      InfiniteData<Awaited<ReturnType<typeof getContractsHistory>>> | undefined
    >(key, (data) =>
      data ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
    );
    return refetch();
  }, [enabled, queryClient, volunteerId, refetch]);
  return { ...query, refetch, reloadFirstPage };
};
