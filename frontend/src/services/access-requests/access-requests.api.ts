/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';
import { AxiosResponseHeaders } from 'axios';
import { RequestStatus } from '../../common/enums/request-status.enum';
import { formatEndDateISO9075, formatStartDateISO9075 } from '../../common/utils/utils';

export const getNewAccessRequests = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  createdOnStart?: Date,
  createdOnEnd?: Date,
  city?: string,
  county?: string,
): Promise<IPaginatedEntity<IAccessRequest>> => {
  return API.get('/access-request/new', {
    params: {
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      ...(createdOnStart ? { createdOnStart: formatStartDateISO9075(createdOnStart) } : {}),
      ...(createdOnEnd ? { createdOnEnd: formatEndDateISO9075(createdOnEnd) } : {}),
      city,
      county,
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
  city?: string,
  county?: string,
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
      city,
      county,
      ...(createdOnStart ? { createdOnStart: formatStartDateISO9075(createdOnStart) } : {}),
      ...(createdOnEnd ? { createdOnEnd: formatEndDateISO9075(createdOnEnd) } : {}),
      ...(rejectedOnStart ? { rejectedOnStart: formatStartDateISO9075(rejectedOnStart) } : {}),
      ...(rejectedOnEnd ? { rejectedOnEnd: formatEndDateISO9075(rejectedOnEnd) } : {}),
    },
  }).then((res) => res.data);
};

export const downloadAccessRequests = async (
  status: RequestStatus,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  createdOnStart?: Date,
  createdOnEnd?: Date,
  locationId?: string,
  rejectedOnStart?: Date,
  rejectedOnEnd?: Date,
): Promise<{ data: any; headers: AxiosResponseHeaders }> => {
  return API.get('/access-request/download', {
    params: {
      status,
      orderBy,
      orderDirection,
      search,
      ...(createdOnStart ? { createdOnStart: formatStartDateISO9075(createdOnStart) } : {}),
      ...(createdOnEnd ? { createdOnEnd: formatEndDateISO9075(createdOnEnd) } : {}),
      ...(rejectedOnStart ? { rejectedOnStart: formatStartDateISO9075(rejectedOnStart) } : {}),
      ...(rejectedOnEnd ? { rejectedOnEnd: formatEndDateISO9075(rejectedOnEnd) } : {}),
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
