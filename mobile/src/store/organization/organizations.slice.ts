import { IOrganizationListItem } from '../../common/interfaces/organization-list-item.interface';

export const organizationsSlice = (set: any) => ({
  organizations: [],
  setOrganizations: (organizations: IOrganizationListItem[]) => {
    set({ organizations });
  },
  addOrganization: (organization: IOrganizationListItem) =>
    set((state: any) => ({
      organizations: [...state.organizations, organization],
    })),
});

export default { organizationsSlice };
