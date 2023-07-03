import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAnouncement } from '../../common/interfaces/anouncement.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection?: OrderDirection;
  limit?: number;
}

export const getAnouncements = async ({
  pageParam = 1,
  limit = 25,
  orderDirection = OrderDirection.DESC,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IAnouncement>> => {
  return API.get('/mobile/anouncement', {
    params: {
      page: pageParam,
      limit,
      orderDirection,
      ...params,
    },
  }).then((res) => res.data);
};
