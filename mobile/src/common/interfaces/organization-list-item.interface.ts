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
}
