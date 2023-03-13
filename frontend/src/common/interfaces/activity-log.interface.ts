import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IUser } from './user.interface';

export interface IActivityLog {
  id: string;
  task: Pick<IActivityType, 'icon' | 'name'>;
  hours: number;
  execution_date: Date;
  volunteer: Pick<IUser, 'id' | 'name'>;
  status: ActivityLogStatus;
  registration_date?: Date;
}
