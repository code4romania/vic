import { IActivityTypeListItem } from './activity-type-list-item.interface';
import { IOrganizationStructureItem } from './organization-structure-item.interface';

export interface IActivityLogItem {
  id: string;
  date: string;
  hours: number;
  activityType: IActivityTypeListItem;
  event?: IOrganizationStructureItem;
}
