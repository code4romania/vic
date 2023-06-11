import { IOrganizationListItem } from './organization-list-item.interface';
import { IOrganizationStructureItem } from './organization-structure-item.interface';
import { IUserProfile } from './user-profile.interface';

interface IVolunteerProfile {
  email: string;
  phone: string;
  activeSince?: Date;
  branch?: IOrganizationStructureItem;
  department?: IOrganizationStructureItem;
  role?: IOrganizationStructureItem;
}

export interface IVolunteer {
  id: string;
  status: string;
  user: IUserProfile;
  createdOn: Date;
  organization: IOrganizationListItem;
  profile: IVolunteerProfile;
}
