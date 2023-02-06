import { useQuery } from 'react-query';
import { getOrganizationDescription } from './EditOrganization.api';

export const useOrganizationDescriptionQuery = () =>
  useQuery(['organization_description', (id: string) => getOrganizationDescription(id)]);
