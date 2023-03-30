import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { ActivityTypeStatus } from '../../common/enums/activity-type-status.enum';
import { ACTIVITY_TYPE_ERRORS } from '../../common/errors/entities/activty-type.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { ActivityCategoryFormTypes } from '../../components/ActivityTypeForm';
import {
  activateActivityType,
  archiveActivityType,
  createActivityType,
  getActivityType,
  getActivityTypeListItems,
  getActivityTypes,
  updateActivityType,
} from './activity-type.api';

export const useActivityTypesQuery = (
  search?: string,
  branchId?: string,
  departmentId?: string,
  roleId?: string,
  status?: ActivityTypeStatus,
) => {
  return useQuery(
    ['activity-types', search, branchId, departmentId, roleId, status],
    () => getActivityTypes(search, branchId, departmentId, roleId, status),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) => error,
    },
  );
};

export const useActivityTypeQuery = (id: string) => {
  return useQuery(['activity-type', id], () => getActivityType(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) => error,
  });
};

export const useCreateActivityTypeMutation = () => {
  return useMutation((data: ActivityCategoryFormTypes) => createActivityType(data), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) =>
      Promise.resolve(error),
  });
};

export const useUpdateActivityTypeMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<ActivityCategoryFormTypes> }) =>
      updateActivityType(id, data),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useActivateActivityTypeMutation = () => {
  return useMutation((id: string) => activateActivityType(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) =>
      Promise.resolve(error),
  });
};

export const useArchiveActivityTypeMutation = () => {
  return useMutation((id: string) => archiveActivityType(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) =>
      Promise.resolve(error),
  });
};

// //Listing activity type

export const useActivityTypeListItemsQuery = (params: {
  branchId?: string;
  departmentId?: string;
  roleId?: string;
  search?: string;
  status?: ActivityTypeStatus;
}) => {
  return useQuery(
    [
      'activity-type-list-items',
      params.branchId,
      params.departmentId,
      params.roleId,
      params.search,
      params.status,
    ],
    () => getActivityTypeListItems(params),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_TYPE_ERRORS>>) => error,
    },
  );
};
