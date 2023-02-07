import { useQuery } from 'react-query';
import { getOrganizationDescription } from './EditOrganization.api';

export const useOrganizationDescriptionQuery = () => {
  return useQuery(['organization_description'], () => getOrganizationDescription());
};
