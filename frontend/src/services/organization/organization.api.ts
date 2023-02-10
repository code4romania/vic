import API from '../api';
import { IOrganization } from '../../components/OrganizationProfile';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/ViewAccesCodes';

export const getOrganization = async (): Promise<IOrganization> => {
  return API.get(`/organization`).then((res) => res.data);
};

export const updateOrganizationDescription = async (
  description: string,
): Promise<IOrganization> => {
  return API.patch(`/organization`, { description }).then((res) => res.data);
};

export const getAccessCodes = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessCode>> => {
  return API.get(`/access-codes`, { params: { limit, page, orderBy, orderDirection } }).then(
    (res) => res.data,
  );
};
