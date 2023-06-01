import { IOrganizationMenuItem } from '../../common/interfaces/organization-menu-item.interface';

export const organizationsSlice = (set: any) => ({
  organizations: [],
  setOrganizations: (organizations: IOrganizationMenuItem[]) => {
    set({ organizations });
  },
});

export default { organizationsSlice };
