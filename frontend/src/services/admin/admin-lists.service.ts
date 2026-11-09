import { useQuery } from 'react-query';
import { getAdminOrganizations, getAdminVolunteers, IAdminListParams } from './admin-lists.api';

export const useAdminOrganizationsQuery = (params: IAdminListParams, enabled: boolean) =>
  useQuery(['admin-organizations', params], () => getAdminOrganizations(params), {
    enabled,
    keepPreviousData: true,
  });

export const useAdminVolunteersQuery = (params: IAdminListParams, enabled: boolean) =>
  useQuery(['admin-volunteers', params], () => getAdminVolunteers(params), {
    enabled,
    keepPreviousData: true,
  });
