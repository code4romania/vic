import { NewsType } from '../../common/enums/news-type.enum';
import { INewsItem } from '../../common/interfaces/news-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  type: NewsType;
}

export const getNews = async ({
  pageParam = 1,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<INewsItem>> => {
  return API.get('/mobile/news', {
    params: {
      limit: 25,
      page: pageParam,
      ...params,
    },
  }).then((res) => res.data);
};
