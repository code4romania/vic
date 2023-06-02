import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IOrganizationListItem } from '../../common/interfaces/organization-list-item.interface';
import { IOrganization } from '../../common/interfaces/organization.interface';
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

export const getMyOrganizations = (): Promise<IOrganizationListItem[]> => {
  return API.get('/mobile/organization/profiles').then((res) => res.data);
};

export const getOrganization = (organizationId: string): Promise<IOrganization> => {
  return API.get(`/mobile/organization/${organizationId}`).then((res) => res.data);
};
