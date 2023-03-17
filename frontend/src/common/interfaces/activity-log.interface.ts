import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IUser } from './user.interface';

export interface IActivityLog {
  id: string;
  date: Date;
  hours: number;
  task: Pick<IActivityType, 'icon' | 'name'>;
  volunteer: Pick<IUser, 'id' | 'name'>;
  status: ActivityLogStatus;
  registrationDate?: Date;
  mention?: string;
  registeredBy?: Pick<IUser, 'id' | 'name'>;
  event?: { id: string; name: string };
  approvedBy?: Pick<IUser, 'id' | 'name'>;
  rejectedBy?: Pick<IUser, 'id' | 'name'>;
  rejectDate?: Date;
  approveDate?: Date;
  rejectReason?: string;
}
