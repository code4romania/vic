import { useQuery } from 'react-query';
import { getMonthlyStatistics } from './statistics.api';

export const useMonthlyStatistics = () => {
  return useQuery(['monthly-statistics'], () => getMonthlyStatistics());
};
