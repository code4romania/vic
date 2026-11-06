import {
  IOrganization,
  IPendingOrganization,
} from '../../common/interfaces/organization.interface';
import API from '../api';

// Super admins only (SuperAdminGuard).
export const getPendingValidation = async (): Promise<IPendingOrganization[]> =>
  API.get('/admin/organizations/pending-validation').then((res) => res.data);

export const validateOrganization = async (id: string): Promise<IOrganization> =>
  API.patch(`/admin/organizations/${id}/validate`).then((res) => res.data);

// Blocks every admin of the NGO at login (AUTH_004) without changing their own status (R8).
export const suspendOrganization = async (id: string): Promise<IOrganization> =>
  API.patch(`/admin/organizations/${id}/suspend`).then((res) => res.data);
