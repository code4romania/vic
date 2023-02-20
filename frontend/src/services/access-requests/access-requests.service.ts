import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACEESS_CODE_ERRORS } from '../../common/errors/entities/access-request.errors';
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
) => {
  return useQuery(
    ['new-access-requests', limit, page, orderBy, orderDirection],
    () => getNewAccessRequests(limit, page, orderBy, orderDirection),
    {
      enabled: !!(limit && page),
      onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => error,
    },
  );
};

export const useRejectedAccessRequestsQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['rejected-access-requests', limit, page, orderBy, orderDirection],
    () => getRejectedAccessRequests(limit, page, orderBy, orderDirection),
    {
      enabled: !!(limit && page),
      onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => error,
    },
  );
};

export const useApproveAccessRequestMutation = () => {
  return useMutation(['access-request'], (id: string) => approveAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => Promise.resolve(error),
  });
};

export const useRejectAccessRequestMutation = () => {
  return useMutation(
    ['access-request'],
    ({ id, rejectMessage }: { id: string; rejectMessage?: string }) =>
      rejectAccessRequest(id, rejectMessage),
    {
      onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useAccessRequestQuery = (id: string) => {
  return useQuery(['access-requests', id], () => getAccessRequest(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => error,
  });
};

export const useDeleteAccessRequestMutation = () => {
  return useMutation(['access-request'], (id: string) => deleteAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<ACEESS_CODE_ERRORS>>) => Promise.resolve(error),
  });
};
