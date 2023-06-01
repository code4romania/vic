import { IOrganizationListItem } from './organization-list-item.interface';
import { IUserProfile } from './user-profile.interface';

export interface IVolunteer {
  id: string;
  status: string;
  user: IUserProfile;
  createdOn: Date;
  organization: IOrganizationListItem;
}
