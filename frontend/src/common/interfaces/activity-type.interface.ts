import { IDivision } from '../../components/Divisions';
import { ActivityTypeStatus } from '../enums/activity-type-status.enum';
import { IBaseEntity } from './base-entity.interface';

export interface IActivityType extends IBaseEntity {
  id: string;
  name: string;
  icon: string;
  role: Pick<IDivision, 'id' | 'name'>;
  department: Pick<IDivision, 'id' | 'name'>;
  branch: Pick<IDivision, 'id' | 'name'>;
  status: ActivityTypeStatus;
}
