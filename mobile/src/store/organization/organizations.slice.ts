import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';

export const organizationsSlice = (set: any) => ({
  organizations: [],
  setOrganizations: (organizations: IOrganizationVolunteer[]) => {
    set({ organizations });
  },
  addOrganization: (organization: IOrganizationVolunteer) =>
    set((state: any) => ({
      organizations: [...state.organizations, organization],
    })),
});

export default { organizationsSlice };
