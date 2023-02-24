import { ActivityTypeStatus } from '../enums/activity-type-status.enum';
import { IBaseEntity } from './base-entity.interface';
import { IDivisionListItem } from './division.interface';

export interface IActivityType extends IBaseEntity {
  id: string;
  name: string;
  icon: string;
  role: IDivisionListItem;
  department: IDivisionListItem;
  branch: IDivisionListItem;
  status: ActivityTypeStatus;
}
