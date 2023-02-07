import { useQuery } from 'react-query';
import { getRegistration } from './volunteer.api';

export const useGetRegistrationQuery = (id: string) => {
  return useQuery(['volunteers', id], () => getRegistration(id), { enabled: !!id });
};
