import { useQuery } from 'react-query';
import { getUserProfile } from './profile.api';

export const useUserProfile = () => useQuery(['profile'], () => getUserProfile());
