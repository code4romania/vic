import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/AccesCodes';
import { AccessCodeFormTypes } from '../../components/AccessCodeForm';
import { IOrganization } from '../../common/interfaces/organization.interface';

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
  return API.get('access-code', { params: { limit, page, orderBy, orderDirection } }).then(
    (res) => res.data,
  );
};

export const getAccessCode = async (id: string): Promise<IAccessCode> => {
  return API.get(`access-code/${id}`).then((res) => res.data);
};

export const createAccessCode = async (accessCode: AccessCodeFormTypes): Promise<IAccessCode> => {
  return API.post('access-code', accessCode).then((res) => res.data);
};

export const updateAccessCode = async (id: string, endDate?: Date): Promise<IAccessCode> => {
  return API.patch(`access-code/${id}`, { endDate }).then((res) => res.data);
};
