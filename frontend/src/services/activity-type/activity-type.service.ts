import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { ACTIVITY_TYPE_ERRORS } from '../../common/errors/entities/activty-type.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getActivityTypes } from './activity-type.api';

export const useActivityTypesQuery = () => {
  return useQuery(['activity-types'], () => getActivityTypes(), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) => error,
  });
};
