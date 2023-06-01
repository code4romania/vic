import { useContext } from 'react';
import { OrganizationContext } from '../contexts/organization/OrganizationContext';

export function useActiveOrganization() {
  return useContext(OrganizationContext);
}
