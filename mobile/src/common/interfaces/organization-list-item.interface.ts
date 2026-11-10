export interface IOrganizationListItem {
  id: string;
  name: string;
  logo?: string;
}

export interface IOrganizationListItemWithNumberOfVolunteers extends IOrganizationListItem {
  numberOfVolunteers: number;
}

export interface IOrganizationVolunteer extends IOrganizationListItem {
  volunteerId: string;
  volunteerProfileId: string | null;
  // 'inactive' when the organization made the volunteer inactive: the organization and its
  // documents stay visible, nothing else can be done there (#472, #589).
  volunteerStatus?: 'active' | 'inactive';
}

export const isInactiveVolunteer = (organization?: IOrganizationVolunteer | null): boolean =>
  organization?.volunteerStatus === 'inactive';
