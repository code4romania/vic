import { useQuery } from 'react-query';
import { getMonthlyStatistics, getPersonalStatistics, getVicStatistics } from './statistics.api';

export const useMonthlyStatistics = () => {
  return useQuery(['monthly-statistics'], () => getMonthlyStatistics());
};

export const useVicStatistics = () => {
  return useQuery(['vic-statistics'], () => getVicStatistics());
};

// Profil: approved hours, events and years in VIC. Refetch it after logging hours.
export const usePersonalStatistics = () => {
  return useQuery(['personal-statistics'], () => getPersonalStatistics());
};
