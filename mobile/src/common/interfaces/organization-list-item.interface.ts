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
  // 'candidate' until the NGO activates a volunteer it added and who then made an account (#590).
  volunteerStatus?: 'active' | 'inactive' | 'candidate';
}

export const isInactiveVolunteer = (organization?: IOrganizationVolunteer | null): boolean =>
  organization?.volunteerStatus === 'inactive';

export const isCandidateVolunteer = (organization?: IOrganizationVolunteer | null): boolean =>
  organization?.volunteerStatus === 'candidate';
