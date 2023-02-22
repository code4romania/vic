import { IDivision } from '../../components/Divisions';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IUser } from './user.interface';

export interface IVolunteer {
  id: string;
  createdBy: IUser;
  role: Pick<IDivision, 'id' | 'name'>;
  department: Pick<IDivision, 'id' | 'name'>;
  branch: Pick<IDivision, 'id' | 'name'>;
  startedOn: Date;
  email: string;
  phone: string;
  status: VolunteerStatus;
  archivedOn?: Date;
  blockedOn?: Date;
  archivedBy?: Pick<IUser, 'id' | 'name'>;
  blockedBy?: Pick<IUser, 'id' | 'name'>;
}
