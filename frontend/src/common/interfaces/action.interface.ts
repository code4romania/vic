import { TrackedEventName } from '../enums/actions.enum';
import { DivisionType } from '../enums/division-type.enum';

export interface IAction {
  id: string;
  author: { id: string; name: string };
  eventName: TrackedEventName;
  eventData: object;
  changes: object;
  createdOn: Date;
}

export interface IEventData {
  organizationId?: string;
  organizationName?: string;
  organizationStructureName?: string;
  organizationStructureId?: string;
  organizationStructureType?: DivisionType;
  accessRequestId?: string;
  userId?: string;
  userName?: string;
  volunteerId?: string;
  volunteerName?: string;
  oldStatus?: string;
  newStatus?: string;
  activityLogId?: string;
  activityTypeId?: string;
  activityTypeName?: string;
  eventId?: string;
  eventName?: string;
  status?: string;
  announcementId?: string;
  announcementTitle?: string;
  contractId?: string;
  contractNumber?: string;
  documentContractId?: string;
  documentContractNumber?: string;
  documentTemplateId?: string;
  documentTemplateName?: string;
}
