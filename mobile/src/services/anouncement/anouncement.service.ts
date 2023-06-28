import { useQuery } from 'react-query';
import { getAnouncements } from './anouncement.api';

export const useAnouncementsSnapshot = () => {
  return useQuery(['anouncements-snapshot'], () => getAnouncements({ limit: 2 }));
};

export const useAnouncementsQuery = () => {
  return useQuery(['anouncements'], () => getAnouncements({}));
};
