/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';
import { AxiosResponseHeaders } from 'axios';
import { RequestStatus } from '../../common/enums/request-status.enum';

export const getNewAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  start?: Date,
  end?: Date,
  locationId?: string,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/new', {
    params: { limit, page, orderBy, orderDirection, search, start, end, locationId },
  }).then((res) => res.data);
};

export const getRejectedAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  start?: Date,
  end?: Date,
  locationId?: string,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/rejected', {
    params: { limit, page, orderBy, orderDirection, search, start, end, locationId },
  }).then((res) => res.data);
};

export const downloadAccessRequests = async (
  status: RequestStatus,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  start?: Date,
  end?: Date,
  locationId?: string,
): Promise<{ data: any; headers: AxiosResponseHeaders }> => {
  return API.get('/access-request/download', {
    params: {
      status,
      orderBy,
      orderDirection,
      search,
      start,
      end,
      locationId,
    },
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
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
