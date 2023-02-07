import { useQuery } from 'react-query';
import { getOrganizationProfile } from './organizationProfile.api';

export const useOrganizationProfileQuery = () => {
  return useQuery(['organization_profile'], () => getOrganizationProfile());
};
