import API from '../api';
import { IActivityCategory } from '../../pages/ActivityCategories';

export const getActivityCategories = async (): Promise<IActivityCategory[]> => {
  return API.get('/activity-categories').then((res) => res.data);
};
