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
  // with status=active: true = confirmed but not validated yet, false = validated
  awaitingValidation?: boolean;
}

// What the super admin sees (audit M1): the stored status alone mixes up "email not confirmed"
// (pending) and "waiting for validation" (active, never validated).
export type AdminOrganizationDisplayStatus = 'unconfirmed' | 'validation' | 'active' | 'suspended';

export const ADMIN_ORGANIZATION_DISPLAY_STATUSES: AdminOrganizationDisplayStatus[] = [
  'unconfirmed',
  'validation',
  'active',
  'suspended',
];

export const displayStatusOf = (
  organization: Pick<IAdminOrganizationListItem, 'status' | 'validatedAt'>,
): AdminOrganizationDisplayStatus => {
  if (organization.status === 'pending') return 'unconfirmed';
  if (organization.status === 'suspended') return 'suspended';
  return organization.validatedAt ? 'active' : 'validation';
};

// The list filter for a displayed status
export const filterOfDisplayStatus = (
  status?: AdminOrganizationDisplayStatus,
): Pick<IAdminListParams, 'status' | 'awaitingValidation'> => {
  switch (status) {
    case 'unconfirmed':
      return { status: 'pending' };
    case 'validation':
      return { status: 'active', awaitingValidation: true };
    case 'active':
      return { status: 'active', awaitingValidation: false };
    case 'suspended':
      return { status: 'suspended' };
    default:
      return {};
  }
};

export const getAdminOrganizations = async (
  params: IAdminListParams,
): Promise<IPaginatedEntity<IAdminOrganizationListItem>> =>
  API.get('/admin/organizations', { params }).then((res) => res.data);

export const getAdminVolunteers = async (
  params: IAdminListParams,
): Promise<IPaginatedEntity<IAdminVolunteerListItem>> =>
  API.get('/admin/volunteers', { params }).then((res) => res.data);
