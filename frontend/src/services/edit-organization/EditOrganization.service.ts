import { useQuery, useMutation } from 'react-query';
import { getOrganizationDescription, updateOrganizationDescription } from './EditOrganization.api';

export const useOrganizationDescriptionQuery = () => {
  return useQuery(['organization_description'], () => getOrganizationDescription());
};

export const useUpdateOrganizationDescriptionMutation = () => {
  return useMutation((description: string) => updateOrganizationDescription(description));
};
