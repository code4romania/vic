import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IUser } from './user.interface';

export interface IActivityLog {
  id: string;
  date: Date;
  hours: number;
  status: ActivityLogStatus;
  mentions?: string;
  volunteer: Pick<IUser, 'id' | 'name'>;
  createdByAdmin?: Pick<IUser, 'id' | 'name'>;
  activityType: Pick<IActivityType, 'id' | 'name'> & { icon?: string };
  event?: { id: string; name: string };
  rejectionReason?: string;
  rejectedOn?: Date;
  rejectedBy?: Pick<IUser, 'id' | 'name'>;
  createdOn?: Date;
  approvedBy?: Pick<IUser, 'id' | 'name'>;
  approvedOn?: Date;
}
