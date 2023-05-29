import { OrganizatinVolunteerStatus } from '../../common/enums/organization-volunteer-status.enum';
import { IOrganization } from '../../common/interfaces/organization.interface';

export const organizationSlice = (set: any) => ({
  organization: undefined,
  setOrganization: (organization: IOrganization) => {
    set({ organization });
  },
  setOrganizationPending: () =>
    set((state: any) => ({
      organization: {
        ...state.organization,
        organizationVolunteerStatus: OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING,
      },
    })),
  resetOrganizationVolunteerStatus: () =>
    set((state: any) => ({
      organization: {
        ...state.organization,
        organizationVolunteerStatus: undefined,
      },
    })),
});

export default { organizationSlice };
