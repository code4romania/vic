import API from '../api';
import { CategoryStatus } from '../../pages/ActivityCategories';
import { IActivityCategory } from '../../pages/ActivityCategories';
import { ActivityCategoryFormTypes } from '../../pages/AddActivity';

export const getActivityCategories = async (): Promise<IActivityCategory[]> => {
  // return API.get('/activity-categories').then((res) => res.data);
  return Promise.resolve([
    {
      id: '1',
      name: 'Outdoor',
      icon: 'logo.svg',
      role: 'Activity Organizer',
      department: 'Recreation',
      branch: 'Parks and Recreation',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '2',
      name: 'Indoor',
      icon: 'logo.svg',
      role: 'Activity Organizer',
      department: 'Recreation',
      branch: 'Parks and Recreation',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '3',
      name: 'Music',
      icon: 'logo.svg',
      role: 'Activity Organizer',
      department: 'Arts and Culture',
      branch: 'Community Center',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '4',
      name: 'Dance',
      icon: 'logo.svg',
      role: 'Activity Organizer',
      department: 'Arts and Culture',
      branch: 'Community Center',
      status: CategoryStatus.DISABLED,
    },
    {
      id: '5',
      name: 'Sports',
      icon: 'logo.svg',
      role: 'Activity Organizer',
      department: 'Recreation',
      branch: 'Parks and Recreation',
      status: CategoryStatus.ACTIVE,
    },
  ]);
};

export const getActivityCategory = async (id: string): Promise<IActivityCategory> => {
  return API.get(`/activity-categories/${id}`).then((res) => res.data);
};

export const updateActivityCategory = async (
  id: string,
  data: ActivityCategoryFormTypes,
): Promise<IActivityCategory> => {
  return API.patch(`/activity-categories/${id}`, { data }).then((res) => res.data);
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
