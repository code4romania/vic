import { useQuery } from 'react-query';
import { getMonthlyStatistics, getVicStatistics } from './statistics.api';

export const useMonthlyStatistics = () => {
  return useQuery(['monthly-statistics'], () => getMonthlyStatistics());
};

export const useVicStatistics = () => {
  return useQuery(['vic-statistics'], () => getVicStatistics());
};
