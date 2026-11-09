import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';
import {
  INotificationsSettings,
  IUserProfile,
} from '../../common/interfaces/user-profile.interface';

export const profileSlice = (set: any) => ({
  userProfile: null,
  setUserProfile: (userProfile: IUserProfile | null) => {
    set({ userProfile });
  },
  setActiveOrganization: (organization: IOrganizationVolunteer) =>
    set((state: any) => ({
      userProfile: {
        ...state.userProfile,
        activeOrganization: {
          ...organization,
        },
      },
    })),
  updateSettings: (newSettings: INotificationsSettings) =>
    set((state: any) => ({
      userProfile: {
        ...state.userProfile,
        notificationsSettings: newSettings,
      },
    })),
});

export default { profileSlice };
