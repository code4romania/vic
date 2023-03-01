import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IDivisionListItem } from './division.interface';
import { IUser } from './user.interface';

export interface IVolunteer {
  id: string;
  createdOn: Date;
  updatedOn: Date;
  user: Pick<IUser, 'id' | 'name'>;
  status: VolunteerStatus;
  archivedOn?: Date;
  blockedOn?: Date;
  archivedBy?: Pick<IUser, 'id' | 'name'>;
  blockedBy?: Pick<IUser, 'id' | 'name'>;
  organizationId: string;
  profile?: IVolunteerProfile;
}

interface IVolunteerProfile {
  email: string;
  phone: string;
  activeSince: Date;
  role?: IDivisionListItem;
  department?: IDivisionListItem;
  branch?: IDivisionListItem;
}
