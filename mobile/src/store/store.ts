import { create } from 'zustand';
import { IOrganization } from '../common/interfaces/organization.interface';
import { IOrganizationMenuItem } from '../common/interfaces/organization-menu-item.interface';
import { organizationSlice } from './organization/organization.slice';
import { bottomSheetSlice } from './bottom-sheet/bottom-sheet.slice';
import { organizationsSlice } from './organization/organizations.slice';

interface OrganizationState {
  organization?: IOrganization;
  setOrganization: (organization: IOrganization) => void;
  setOrganizationPending: () => void;
  resetOrganizationVolunteerStatus: () => void;
}

interface VolunteerState {
  organizations: IOrganizationMenuItem[];
  setOrganizations: (organizations: IOrganizationMenuItem[]) => void;
}

interface BottomSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useStore = create<OrganizationState & BottomSheetState & VolunteerState>()((set: any) => ({
  ...organizationSlice(set),
  ...bottomSheetSlice(set),
  ...organizationsSlice(set),
}));

export default useStore;
