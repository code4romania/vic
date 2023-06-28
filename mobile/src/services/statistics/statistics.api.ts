import { IMonthlyStatistics } from '../../common/interfaces/monthly-statistics.interface';
import API from '../api';

export const getMonthlyStatistics = async (): Promise<IMonthlyStatistics> => {
  return API.get('/mobile/statistics/monthly').then((res) => res.data);
};
