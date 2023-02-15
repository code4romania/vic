import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  getVolunteers,
  getAccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  deleteAccessRequest,
} from './volunteer.api';
import { PaginationConfig } from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { VolunteerStatus } from '../../pages/Volunteers';

export const useAcceesRequestQuery = (id: string) => {
  return useQuery(['access-request', id], () => getAccessRequest(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};

export const useApproveAccessRequestMutation = () => {
  return useMutation(['volunteer'], (id: string) => approveAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useRejectAccessRequestMutation = () => {
  return useMutation(
    ['volunteer'],
    ({ id, rejectMessage }: { id: string; rejectMessage?: string }) =>
      rejectAccessRequest(id, rejectMessage),
    {
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
    },
  );
};

export const useDeleteAccessRequestMutation = () => {
  return useMutation(['volunteer'], (id: string) => deleteAccessRequest(id), {
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => Promise.resolve(error),
  });
};

export const useVolunteersQuery = (
  filterStatus: VolunteerStatus,
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderBy?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['volunteers', filterStatus, limit, page, orderBy, orderDirection],
    () => getVolunteers(filterStatus, limit, page, orderBy, orderDirection),
    {
      enabled: !!(filterStatus && limit && page),
      onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
    },
  );
};
