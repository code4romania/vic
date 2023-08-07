import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IOrganizationListItemWithNumberOfVolunteers } from '../../common/interfaces/organization-list-item.interface';
import { IOrganization } from '../../common/interfaces/organization.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
}

export const getOrganizations = async ({
  pageParam = 1,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IOrganizationListItemWithNumberOfVolunteers>> => {
  return API.get('/mobile/organization', {
    params: {
      limit: 25,
      page: pageParam,
      ...params,
    },
  }).then((res) => res.data);
};

export const getOrganization = async (organizationId: string): Promise<IOrganization> => {
  return API.get(`/mobile/organization/${organizationId}`).then((res) => res.data);
};

export const switchOrganization = async (organizationId: string): Promise<IOrganization> => {
  return API.patch(`/mobile/organization/${organizationId}`).then((res) => res.data);
};

export const leaveOrganization = async (volunteerId: string): Promise<IOrganization> => {
  return API.delete(`/mobile/organization/${volunteerId}`).then((res) => res.data);
};

export const rejoinOrganization = async (volunteerId: string): Promise<IOrganization> => {
  return API.patch(`/mobile/organization/${volunteerId}/rejoin`).then((res) => res.data);
};
