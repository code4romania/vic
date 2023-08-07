import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityLogItem } from './activity-log-item.interface';
import { IOrganizationListItem } from './organization-list-item.interface';

export interface IActivityLog extends IActivityLogItem {
  mentions?: string;
  status: ActivityLogStatus;
  approvedOn?: string;
  rejectedOn?: string;
  rejectionReason?: string;
  organization: IOrganizationListItem;
}
