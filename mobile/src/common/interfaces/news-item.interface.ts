import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { TrackedEventName } from '../enums/tracked-event-name.enum';

export interface INewsItem {
  id: string;
  organizationLogo: string;
  organizationName: string;
  activityLogId?: string;
  contractId?: string;
  organizationId?: string;
  eventName: TrackedEventName;
  newStatus?: ActivityLogStatus;
}
