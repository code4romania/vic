import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IEvent } from './event.interface';
import { IUser } from './user.interface';

export interface IActivityLogListItem {
  id: string;
  date: Date;
  hours: number;
  status: ActivityLogStatus;
  volunteer?: Pick<IUser, 'id' | 'name'>;
  task?: Pick<IActivityType, 'id' | 'icon' | 'name'>;
  event?: Pick<IEvent, 'id' | 'name'>;
  createdOn: Date;
}
