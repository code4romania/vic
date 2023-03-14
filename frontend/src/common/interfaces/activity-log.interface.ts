import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityType } from './activity-type.interface';
import { IUser } from './user.interface';

export interface IActivityLog {
  id: string;
  task: Pick<IActivityType, 'icon' | 'name'>;
  hours: number;
  executionDate: Date;
  volunteer: Pick<IUser, 'id' | 'name'>;
  status: ActivityLogStatus;
  registrationDate?: Date;
}
