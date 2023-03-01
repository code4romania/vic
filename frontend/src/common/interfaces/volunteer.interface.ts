import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IDivisionListItem } from './division.interface';
import { IUser } from './user.interface';

export interface IVolunteer {
  id: string;
  createdOn: Date;
  createdBy: IUser;
  role: IDivisionListItem;
  department: IDivisionListItem;
  branch: IDivisionListItem;
  startedOn: Date;
  email: string;
  phone: string;
  status: VolunteerStatus;
  archivedOn?: Date;
  blockedOn?: Date;
  archivedBy?: Pick<IUser, 'id' | 'name'>;
  blockedBy?: Pick<IUser, 'id' | 'name'>;
}
//TO DO: create interface for achivedBy and blockedBy
