import { IMonthlyStatistics } from '../../common/interfaces/monthly-statistics.interface';
import { ITeoStatistics } from '../../common/interfaces/teo-statistics.interface';
import API from '../api';

export const getMonthlyStatistics = async (): Promise<IMonthlyStatistics> => {
  return API.get('/mobile/statistics/monthly').then((res) => res.data);
};

export const getTeoStatistics = async (): Promise<ITeoStatistics> => {
  return API.get('/mobile/statistics/teo').then((res) => res.data);
};
