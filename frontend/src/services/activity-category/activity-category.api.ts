import API from '../api';
import { IActivityCategory } from '../../pages/ActivityCategories';
import { ActivityCategoryFormTypes } from '../../pages/AddActivity';

export const getActivityCategories = async (): Promise<IActivityCategory[]> => {
  return API.get('/activity-categories').then((res) => res.data);
};

export const getActivityCategory = async (id: string): Promise<IActivityCategory> => {
  return API.get(`/activity-categories/${id}`).then((res) => res.data);
};

export const updateActivityCategory = async (
  id: string,
  data: ActivityCategoryFormTypes,
): Promise<IActivityCategory> => {
  return API.patch(`/activity-categories/${id}`, {
    ...data,
    department: data.department?.key,
    branch: data.branch?.key,
    role: data.role?.key,
  }).then((res) => res.data);
};

export const createActivityCategory = async (
  data: ActivityCategoryFormTypes,
): Promise<IActivityCategory> => {
  return API.post(`/activity-categories`, {
    ...data,
    department: data.department?.key,
    branch: data.branch?.key,
    role: data.role?.key,
  }).then((res) => res.data);
};

export const activateActivityCategory = async (id: string): Promise<IActivityCategory> => {
  return API.patch(`/activity-categories/${id}/activate`).then((res) => res.data);
};

export const archiveActivityCategory = async (id: string): Promise<IActivityCategory> => {
  return API.patch(`/activity-categories/${id}/archive`).then((res) => res.data);
};
