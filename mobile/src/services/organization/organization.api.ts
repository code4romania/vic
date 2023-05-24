import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IOrganizationListItem } from '../../common/interfaces/organization-list-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
}

export const getOrganizations = ({
  pageParam = 1,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IOrganizationListItem>> => {
  return API.get('/mobile/organization', {
    params: {
      limit: 25,
      page: pageParam,
      ...params,
    },
  }).then((res) => res.data);
};
