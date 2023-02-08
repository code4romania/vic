import { useQuery } from 'react-query';
import { getRegistrationRequests } from './RegistrationRequests.api';

export const useRegistrationRequestsQuery = (status: string) => {
  return useQuery(['registration_requests', status], () => getRegistrationRequests(status));
};
