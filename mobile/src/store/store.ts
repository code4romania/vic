import { create } from 'zustand';
import { IOrganization } from '../common/interfaces/organization.interface';
import { IOrganizationMenuItem } from '../common/interfaces/organization-menu-item.interface';
import { organizationSlice } from './organization/organization.slice';
import { bottomSheetSlice } from './bottom-sheet/bottom-sheet.slice';
import { organizationsSlice } from './organization/organizations.slice';
import { IActiveOrganization } from '../common/interfaces/active-organization.interface';
import { activeOrganizationSlice } from './organization/active-organization.slice';

interface ActiveOrganizationState {
  activeOrganization?: IActiveOrganization;
  setActiveOrganization: (activeOrganization: IActiveOrganization) => void;
}

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

const useStore = create<
  OrganizationState & BottomSheetState & VolunteerState & ActiveOrganizationState
>()((set: any) => ({
  ...organizationSlice(set),
  ...bottomSheetSlice(set),
  ...organizationsSlice(set),
  ...activeOrganizationSlice(set),
}));

export default useStore;
