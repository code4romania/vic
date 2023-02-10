import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getAccessRequest } from './volunteer.api';

export const useAcceesRequestQuery = (id: string) => {
  return useQuery(['access-request', id], () => getAccessRequest(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};
