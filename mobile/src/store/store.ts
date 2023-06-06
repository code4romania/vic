import { create } from 'zustand';
import { IOrganization } from '../common/interfaces/organization.interface';
import { organizationSlice } from './organization/organization.slice';
import { bottomSheetSlice } from './bottom-sheet/bottom-sheet.slice';
import { organizationsSlice } from './organization/organizations.slice';
import { activeOrganizationSlice } from './organization/active-organization.slice';
import { IOrganizationListItem } from '../common/interfaces/organization-list-item.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { volunteerSlice } from './volunteer/volunteer.slice';

interface ActiveOrganizationState {
  activeOrganization?: IOrganizationListItem;
  setActiveOrganization: (activeOrganization: IOrganizationListItem) => void;
}

interface OrganizationState {
  organization?: IOrganization;
  setOrganization: (organization: IOrganization) => void;
  setOrganizationPending: () => void;
  resetOrganizationVolunteerStatus: () => void;
}

interface VolunteerState {
  organizations: IOrganizationListItem[];
  setOrganizations: (organizations: IOrganizationListItem[]) => void;
  addOrganization: (organization: IOrganizationListItem) => void;
}

interface VolunteerProfileState {
  volunteer?: IVolunteer;
  setVolunteer: (volunteer: IVolunteer) => void;
}

interface BottomSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useStore = create<
  OrganizationState &
    BottomSheetState &
    VolunteerState &
    ActiveOrganizationState &
    VolunteerProfileState
>()((set: any) => ({
  ...organizationSlice(set),
  ...bottomSheetSlice(set),
  ...organizationsSlice(set),
  ...activeOrganizationSlice(set),
  ...volunteerSlice(set),
}));

export default useStore;
