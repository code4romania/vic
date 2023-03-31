import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IEvent } from './event.interface';
import { IUser } from './user.interface';

export interface IActivityLogListItem {
  id: string;
  date: Date;
  hours: number;
  status: ActivityLogStatus;
  volunteer: Pick<IUser, 'id' | 'name'>;
  activityType?: Pick<IActivityType, 'id' | 'icon' | 'name'>;
  event?: Pick<IEvent, 'id' | 'name'>;
  createdOn: Date;
}

export interface IActivityLog extends IActivityLogListItem {
  mentions: string;
  createdByAdmin?: Pick<IUser, 'id' | 'name'>;
  rejectionReason?: string;
  rejectedOn?: Date;
  rejectedBy?: Pick<IUser, 'id' | 'name'>;
  approvedOn?: Date;
  approvedBy?: Pick<IUser, 'id' | 'name'>;
}
