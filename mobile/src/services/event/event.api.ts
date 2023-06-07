import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEventListItem } from '../../common/interfaces/event-list-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
}

export const getEvents = ({
  pageParam = 1,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IEventListItem>> => {
  return API.get('/mobile/event', {
    params: {
      limit: 25,
      page: pageParam,
      ...params,
    },
  }).then((res) => res.data);
};
