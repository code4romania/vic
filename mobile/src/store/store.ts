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
import {
  INotificationsSettings,
  IUserPersonalData,
  IUserProfile,
} from '../common/interfaces/user-profile.interface';
import { profileSlice } from './profile/profile.slice';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';

interface UserProfileState {
  userProfile: IUserProfile | null;
  setUserProfile: (userProfile: IUserProfile | null) => void;
  setActiveOrganization: (organization: IOrganizationVolunteer) => void;
  setIdentityData: (personalData: IUserPersonalData) => void;
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
    UserProfileState
>()((set: any) => ({
  ...organizationSlice(set),
  ...bottomSheetSlice(set),
  ...volunteerSlice(set),
  ...eventSlice(set),
  ...activityLogsSlice(set),
  ...profileSlice(set),
}));

export default useStore;
