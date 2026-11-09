import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

// #511, super admins only.
export type AdminOrganizationStatus = 'pending' | 'active' | 'suspended';

export interface IAdminOrganizationListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string | null;
  status: AdminOrganizationStatus;
  validatedAt: string | null;
  createdOn: string;
  volunteers: number;
}

export interface IAdminVolunteerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdOn: string;
  organizations: string[];
}

export interface IAdminListParams {
  page: number;
  limit: number;
  search?: string;
  status?: AdminOrganizationStatus;
}

export const getAdminOrganizations = async (
  params: IAdminListParams,
): Promise<IPaginatedEntity<IAdminOrganizationListItem>> =>
  API.get('/admin/organizations', { params }).then((res) => res.data);

export const getAdminVolunteers = async (
  params: IAdminListParams,
): Promise<IPaginatedEntity<IAdminVolunteerListItem>> =>
  API.get('/admin/volunteers', { params }).then((res) => res.data);
