import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';

export const getNewAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/new', {
    params: { limit, page, orderBy, orderDirection },
  }).then((res) => ({
    items: res.data,
    meta: {
      itemCount: 1,
      itemsPerPage: 5,
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    },
  }));
};

export const getRejectedAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/rejected', {
    params: { limit, page, orderBy, orderDirection },
  }).then((res) => ({
    items: res.data,
    meta: {
      itemCount: 1,
      itemsPerPage: 5,
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    },
  }));
};

export const getAccessRequest = async (id: string): Promise<IAccessRequest> => {
  return API.get(`/access-request/${id}`).then((res) => res.data);
};

export const approveAccessRequest = async (id: string): Promise<IAccessRequest> => {
  return API.post(`/access-request/${id}/approve`).then((res) => res.data);
};

export const rejectAccessRequest = async (
  id: string,
  rejectionReason?: string,
): Promise<IAccessRequest> => {
  return API.post(`/access-request/${id}/reject`, { rejectionReason }).then((res) => res.data);
};

export const deleteAccessRequest = async (id: string): Promise<IAccessRequest> => {
  return API.delete(`/access-request/${id}`).then((res) => res.data);
};
