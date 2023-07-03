import { useQuery } from 'react-query';
import { getMonthlyStatistics, getTeoStatistics } from './statistics.api';

export const useMonthlyStatistics = () => {
  return useQuery(['monthly-statistics'], () => getMonthlyStatistics());
};

export const useTeoStatistics = () => {
  return useQuery(['teo-statistics'], () => getTeoStatistics());
};
