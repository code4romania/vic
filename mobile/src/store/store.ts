import { create } from 'zustand';
import { IOrganization } from '../common/interfaces/organization.interface';
import { organizationSlice } from './organization/organization.slice';

interface OrganizationState {
  organization?: IOrganization;
  setOrganization: (organization: IOrganization) => void;
  setOrganizationPending: () => void;
}

const useStore = create<OrganizationState>()((set: any) => ({ ...organizationSlice(set) }));

export default useStore;
