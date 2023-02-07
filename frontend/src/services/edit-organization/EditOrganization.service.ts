import { useQuery } from 'react-query';
import { getOrganizationDescription } from './EditOrganization.api';

export const useOrganizationDescriptionQuery = (id: string) => {
  return useQuery(['organization_description', id], () => getOrganizationDescription(id), {
    enabled: !!id,
  });
};
