import { IActivityType } from '../../common/interfaces/activity-type.interface';
import API from '../api';

export const getActivityTypes = async (): Promise<IActivityType[]> => {
  return API.get('/activity-type').then((res) => res.data);
};

export const getActivityType = async (id: string): Promise<IActivityType> => {
  return API.get(`/activity-type/${id}`).then((res) => res.data);
};

// export const updateActivityType = async (
//   id: string,
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   data: any,
// ): Promise<IActivityType> => {
//   return API.patch(`/activity-type/${id}`, { data }).then((res) => res.data);
// };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createActivityType = async (data: any): Promise<IActivityType> => {
  return API.post(`/activity-type`, {
    ...data,
    department: data.department?.key,
    branch: data.branch?.key,
    role: data.role?.key,
  }).then((res) => res.data);
};
