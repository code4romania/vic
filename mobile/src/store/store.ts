import { create } from 'zustand';
import { IOrganization } from '../common/interfaces/organization.interface';
import { organizationSlice } from './organization/organization.slice';
import { bottomSheetSlice } from './bottom-sheet/bottom-sheet.slice';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { volunteerSlice } from './volunteer/volunteer.slice';
import { IEvent } from '../common/interfaces/event.interface';
import { eventSlice } from './event/event.slice';
import { IActivityLogCounters } from '../common/interfaces/activity-log-counters.interface';
import { activityLogsSlice } from './activity-log/activity-log.slice';
import { IActivityLog } from '../common/interfaces/activity-log.interface';
import { INotificationsSettings, IUserProfile } from '../common/interfaces/user-profile.interface';
import { profileSlice } from './profile/profile.slice';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';
import { appSlice } from './app/app.slice';

interface UserProfileState {
  userProfile: IUserProfile | null;
  setUserProfile: (userProfile: IUserProfile | null) => void;
  setActiveOrganization: (organization: IOrganizationVolunteer) => void;
  updateSettings: (newSettings: INotificationsSettings) => void;
}

interface OrganizationState {
  organization?: IOrganization;
  setOrganization: (organization: IOrganization) => void;
  setOrganizationPending: () => void;
  resetOrganizationVolunteerStatus: () => void;
}

interface VolunteerProfileState {
  volunteer?: IVolunteer;
  setVolunteer: (volunteer: IVolunteer) => void;
}

interface EventState {
  event?: IEvent;
  setEvent: (event: IEvent) => void;
  joinEvent: () => void;
  canceRsvp: () => void;
  declineEvent: () => void;
}

interface ActivityLogState {
  counters: IActivityLogCounters;
  selectedActivityLog?: IActivityLog;
  setCounters: (counters: IActivityLogCounters) => void;
  setSelectedActivityLog: (activityLog: IActivityLog) => void;
}

interface AppState {
  maintenance: boolean;
  updateRequired: boolean;
  setMaintenance: (maintenance: boolean) => void;
  setUpdateRequired: (updateRequired: boolean) => void;
}

interface BottomSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useStore = create<
  OrganizationState &
    BottomSheetState &
    VolunteerProfileState &
    EventState &
    ActivityLogState &
    UserProfileState &
    AppState
>()((set: any) => ({
  ...organizationSlice(set),
  ...bottomSheetSlice(set),
  ...volunteerSlice(set),
  ...eventSlice(set),
  ...activityLogsSlice(set),
  ...profileSlice(set),
  ...appSlice(set),
}));

export default useStore;

// Everything that belongs to the logged-in user. The app flags (maintenance, update required)
// stay: they describe the backend, not the account.
export const resetUserState = (): void => {
  useStore.setState({
    userProfile: null,
    organization: undefined,
    volunteer: undefined,
    event: undefined,
    counters: { approved: 0, pending: 0, rejected: 0 },
    selectedActivityLog: undefined,
    isOpen: false,
  });
};
