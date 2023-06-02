import { IActiveOrganization } from '../../common/interfaces/active-organization.interface';

export const activeOrganizationSlice = (set: any) => ({
  activeOrganization: undefined,
  setActiveOrganization: (activeOrganization: IActiveOrganization) => {
    set({ activeOrganization });
  },
});

export default { activeOrganizationSlice };
