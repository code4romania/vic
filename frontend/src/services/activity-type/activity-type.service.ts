import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { ACTIVITY_TYPE_ERRORS } from '../../common/errors/entities/activty-type.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { createActivityType, getActivityTypes } from './activity-type.api';

export const useActivityTypesQuery = () => {
  return useQuery(['activity-types'], () => getActivityTypes(), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) => error,
  });
};

export const useCreateActivityCategoryMutation = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation((data: any) => createActivityType(data), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) =>
      Promise.resolve(error),
  });
};
