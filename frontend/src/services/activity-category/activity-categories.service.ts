import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { ACTIVITY_CATEGORY_ERRORS } from '../../common/errors/entities/activty-category.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getActivityCategories } from './activity-category.api';

export const useActivityCategoriesQuery = () => {
  return useQuery(['activity-categories'], () => getActivityCategories(), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) => error,
  });
};
