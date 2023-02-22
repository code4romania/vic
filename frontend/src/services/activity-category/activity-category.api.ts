import API from '../api';
import { CategoryStatus, IActivityCategory } from '../../pages/ActivityCategories';
import { ActivityCategoryFormTypes } from '../../pages/AddActivity';

export const getActivityCategories = async (): Promise<IActivityCategory[]> => {
  // return API.get('/activity-categories').then((res) => res.data);
  return Promise.resolve([
    {
      id: '1',
      name: 'Marketing',
      icon: 'marketing-icon',
      role: 'manager',
      department: 'Sales',
      branch: 'Head Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '2',
      name: 'Development',
      icon: 'development-icon',
      role: 'developer',
      department: 'Engineering',
      branch: 'Main Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '3',
      name: 'Operations',
      icon: 'operations-icon',
      role: 'operations manager',
      department: 'Operations',
      branch: 'Regional Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '4',
      name: 'Human Resources',
      icon: 'hr-icon',
      role: 'hr manager',
      department: 'Human Resources',
      branch: 'Head Office',
      status: CategoryStatus.DISABLED,
    },
    {
      id: '5',
      name: 'Finance',
      icon: 'finance-icon',
      role: 'financial analyst',
      department: 'Accounting',
      branch: 'Main Office',
      status: CategoryStatus.ACTIVE,
    },
  ]);
};

export const getActivityCategory = async (id: string): Promise<IActivityCategory> => {
  // return API.get(`/activity-categories/${id}`).then((res) => res.data);
  const activities = [
    {
      id: '1',
      name: 'Marketing',
      icon: 'marketing-icon',
      role: 'manager',
      department: 'Sales',
      branch: 'Head Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '2',
      name: 'Development',
      icon: 'development-icon',
      role: 'developer',
      department: 'Engineering',
      branch: 'Main Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '3',
      name: 'Operations',
      icon: 'operations-icon',
      role: 'operations manager',
      department: 'Operations',
      branch: 'Regional Office',
      status: CategoryStatus.ACTIVE,
    },
    {
      id: '4',
      name: 'Human Resources',
      icon: 'hr-icon',
      role: 'hr manager',
      department: 'Human Resources',
      branch: 'Head Office',
      status: CategoryStatus.DISABLED,
    },
    {
      id: '5',
      name: 'Finance',
      icon: 'finance-icon',
      role: 'financial analyst',
      department: 'Accounting',
      branch: 'Main Office',
      status: CategoryStatus.ACTIVE,
    },
  ];
  const founded = activities.find((activity) => activity.id === id);
  return Promise.resolve(founded || activities[0]);
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
  // return API.patch(`/activity-categories/${id}/activate`).then((res) => res.data);
  return Promise.resolve({
    id,
    name: 'Human Resources',
    icon: 'hr-icon',
    role: 'hr manager',
    department: 'Human Resources',
    branch: 'Head Office',
    status: CategoryStatus.DISABLED,
  });
};

export const archiveActivityCategory = async (id: string): Promise<IActivityCategory> => {
  // return API.patch(`/activity-categories/${id}/archive`).then((res) => res.data);
  return Promise.resolve({
    id,
    name: 'Human Resources',
    icon: 'hr-icon',
    role: 'hr manager',
    department: 'Human Resources',
    branch: 'Head Office',
    status: CategoryStatus.DISABLED,
  });
};
