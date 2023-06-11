import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';

export const activeOrganizationSlice = (set: any) => ({
  activeOrganization: undefined,
  setActiveOrganization: (activeOrganization: IOrganizationVolunteer) => {
    set({ activeOrganization });
  },
});

export default { activeOrganizationSlice };
