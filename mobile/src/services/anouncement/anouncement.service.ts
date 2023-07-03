import { useInfiniteQuery, useQuery } from 'react-query';
import { getAnouncements } from './anouncement.api';

export const useAnouncementsSnapshot = () => {
  return useQuery(['anouncements-snapshot'], () => getAnouncements({ limit: 2 }));
};

export const useAnouncementsQuery = () => {
  return useQuery(['anouncements'], () => getAnouncements({}));
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
