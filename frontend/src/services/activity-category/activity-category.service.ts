import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { ACTIVITY_CATEGORY_ERRORS } from '../../common/errors/entities/activty-category.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { ActivityCategoryFormTypes } from '../../pages/AddActivity';
import {
  activateActivityCategory,
  archiveActivityCategory,
  createActivityCategory,
  getActivityCategories,
  getActivityCategory,
  updateActivityCategory,
} from './activity-category.api';

export const useActivityCategoriesQuery = () => {
  return useQuery(['activity-categories'], () => getActivityCategories(), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) => error,
  });
};

export const useActivityCategoryQuery = (id: string) => {
  return useQuery(['activity-category'], () => getActivityCategory(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) => error,
  });
};

export const useCreateActivityCategoryMutation = () => {
  return useMutation((data: ActivityCategoryFormTypes) => createActivityCategory(data), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) =>
      Promise.resolve(error),
  });
};

export const useUpdateActivityCategoryMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: ActivityCategoryFormTypes }) =>
      updateActivityCategory(id, data),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useActivateActivityCategory = () => {
  return useMutation((id: string) => activateActivityCategory(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) =>
      Promise.resolve(error),
  });
};

export const useArchiveActivityCategory = () => {
  return useMutation((id: string) => archiveActivityCategory(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_CATEGORY_ERRORS>>) =>
      Promise.resolve(error),
  });
};
