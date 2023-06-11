import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { IActivityLogItem } from './activity-log-item.interface';

export interface IActivityLog extends IActivityLogItem {
  mentions?: string;
  status: ActivityLogStatus;
  approvedOn?: string;
  rejectedOn?: string;
  rejectionReason?: string;
}
