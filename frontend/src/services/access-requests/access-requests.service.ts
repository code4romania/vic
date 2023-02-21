import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACCESS_REQUEST_ERRORS } from '../../common/errors/entities/access-request.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  approveAccessRequest,
  deleteAccessRequest,
  getAccessRequest,
  getNewAccessRequests,
  getRejectedAccessRequests,
  rejectAccessRequest,
} from './access-requests.api';

export const useNewAccessRequestsQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  start?: Date,
  end?: Date,
) => {
  return useQuery(
    ['new-access-requests', limit, page, orderBy, orderDirection, search, start, end],
    () => getNewAccessRequests(limit, page, orderBy, orderDirection, search, start, end),
    {
      enabled: !!(limit && page),
      onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) => error,
    },
  );
};

export const useRejectedAccessRequestsQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
  search?: string,
  start?: Date,
  end?: Date,
) => {
  return useQuery(
    ['rejected-access-requests', limit, page, orderBy, orderDirection, search, start, end],
    () => getRejectedAccessRequests(limit, page, orderBy, orderDirection, search, start, end),
    {
      enabled: !!(limit && page),
      onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) => error,
    },
  );
};

export const useApproveAccessRequestMutation = () => {
  return useMutation(['access-request'], (id: string) => approveAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) =>
      Promise.resolve(error),
  });
};

export const useRejectAccessRequestMutation = () => {
  return useMutation(
    ['access-request'],
    ({ id, rejectMessage }: { id: string; rejectMessage?: string }) =>
      rejectAccessRequest(id, rejectMessage),
    {
      onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useAccessRequestQuery = (id: string) => {
  return useQuery(['access-requests', id], () => getAccessRequest(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) => error,
  });
};

export const useDeleteAccessRequestMutation = () => {
  return useMutation(['access-request'], (id: string) => deleteAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>) =>
      Promise.resolve(error),
  });
};
