import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { getNews, getUnreadNewsCount, markNewsSeen } from './news.api';
import { NewsType } from '../../common/enums/news-type.enum';

export const NEWS_UNREAD_COUNT_KEY = ['news-unread-count'];

export const useNewsInfiniteQuery = (type: NewsType) => {
  return useInfiniteQuery(['news', type], ({ pageParam }) => getNews({ pageParam, type }), {
    getNextPageParam: (lastPage) => {
      return lastPage?.meta.totalPages > lastPage?.meta.currentPage
        ? lastPage?.meta.currentPage + 1
        : undefined;
    },
    enabled: !!type,
  });
};

/** The red badge on the Home bell. */
export const useUnreadNewsCountQuery = () => {
  return useQuery(NEWS_UNREAD_COUNT_KEY, getUnreadNewsCount, {
    select: (data) => data?.unread ?? 0,
  });
};

/** Sent when „Noutăți” opens; the badge refetches (to 0) right after. */
export const useMarkNewsSeenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(markNewsSeen, {
    onSuccess: () => {
      queryClient.setQueryData(NEWS_UNREAD_COUNT_KEY, { unread: 0 });
      queryClient.invalidateQueries(NEWS_UNREAD_COUNT_KEY);
    },
  });
};
