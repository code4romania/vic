import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';

export const getNewAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  createdOnStart?: Date,
  createdOnEnd?: Date,
  locationId?: string,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/new', {
    params: {
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      createdOnStart,
      createdOnEnd,
      locationId,
    },
  }).then((res) => res.data);
};

export const getRejectedAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  createdOnStart?: Date,
  createdOnEnd?: Date,
  locationId?: string,
  rejectedOnStart?: Date,
  rejectedOnEnd?: Date,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/rejected', {
    params: {
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      createdOnStart,
      createdOnEnd,
      locationId,
      rejectedOnStart,
      rejectedOnEnd,
    },
  }).then((res) => res.data);
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
