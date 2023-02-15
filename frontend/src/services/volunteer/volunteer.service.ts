import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  getAccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  deleteAccessRequest,
} from './volunteer.api';

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
