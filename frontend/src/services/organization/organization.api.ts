import API from '../api';
import { IOrganization } from '../../components/OrganizationProfile';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/AccesCodes';

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
  console.log('limit, page, orderBy, orderDirection', limit, page, orderBy, orderDirection);
  return API.get('access-code').then((res) => res.data);
};

export const getAccessCode = async (id: string): Promise<IAccessCode> => {
  return API.get(`access-code/${id}`).then((res) => res.data);
};

export const createAccessCode = async (
  name: string,
  startDate: Date,
  endDate?: Date,
): Promise<IAccessCode> => {
  return API.post('access-code', { name, startDate, endDate }).then((res) => res.data);
};

export const updateAccessCode = async (id: string, endDate?: Date): Promise<IAccessCode> => {
  return API.patch(`access-code/${id}`, { endDate }).then((res) => res.data);
};
