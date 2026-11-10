import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { getAnouncements, respondToAnouncement } from './anouncement.api';

export const useAnouncementsSnapshot = () => {
  return useQuery(['anouncements-snapshot'], () => getAnouncements({ limit: 2 }));
};

export const useAnouncementsInfiniteQuery = () => {
  return useInfiniteQuery(['anouncements'], ({ pageParam }) => getAnouncements({ pageParam }), {
    getNextPageParam: (lastPage) => {
      return lastPage?.meta.totalPages > lastPage?.meta.currentPage
        ? lastPage?.meta.currentPage + 1
        : undefined;
    },
  });
};

// #504
export const useRespondToAnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, comment }: { id: string; comment: string }) => respondToAnouncement(id, comment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['anouncements']);
        queryClient.invalidateQueries(['anouncements-snapshot']);
      },
    },
  );
};
