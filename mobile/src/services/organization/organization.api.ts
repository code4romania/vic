import { IOrganizationListItem } from '../../common/interfaces/organization-list-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
}

export const getOrganizations = ({
  pageParam = 1,
}: PaginationQuery): Promise<IPaginatedEntity<IOrganizationListItem>> => {
  return API.get('/mobile/organization', {
    params: {
      limit: 25,
      page: pageParam,
    },
  }).then((res) => res.data);
};
