import { useInfiniteQuery } from 'react-query';
import { getNews } from './news.api';
import { NewsType } from '../../common/enums/news-type.enum';

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
