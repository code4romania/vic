import { IMonthlyStatistics } from '../../common/interfaces/monthly-statistics.interface';
import { IVicStatistics } from '../../common/interfaces/vic-statistics.interface';
import API from '../api';

export const getMonthlyStatistics = async (): Promise<IMonthlyStatistics> => {
  return API.get('/mobile/statistics/monthly').then((res) => res.data);
};

export const getVicStatistics = async (): Promise<IVicStatistics> => {
  return API.get('/mobile/statistics/vic').then((res) => res.data);
};
