import { IOrganizationStructureItem } from './organization-structure-item.interface';

export interface IActivityLogItem {
  id: string;
  date: string;
  hours: number;
  activityType: IOrganizationStructureItem;
  event?: IOrganizationStructureItem;
}
