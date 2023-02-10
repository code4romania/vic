import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { VOLUNTEER_ERRORS } from '../../common/errors/entities/volunteer.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getRegistration } from './volunteer.api';

export const useGetRegistrationQuery = (id: string) => {
  return useQuery(['volunteers', id], () => getRegistration(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<VOLUNTEER_ERRORS>>) => error,
  });
};
