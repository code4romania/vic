import { IOrganizationListItem } from '../../common/interfaces/organization-list-item.interface';

export const activeOrganizationSlice = (set: any) => ({
  activeOrganization: undefined,
  setActiveOrganization: (activeOrganization: IOrganizationListItem) => {
    set({ activeOrganization });
  },
});

export default { activeOrganizationSlice };
