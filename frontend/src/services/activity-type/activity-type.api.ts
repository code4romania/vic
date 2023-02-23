import { IActivityType } from '../../common/interfaces/activity-type.interface';
import API from '../api';

export const getActivityTypes = async (): Promise<IActivityType[]> => {
  return API.get('/activity-type').then((res) => res.data);
};
