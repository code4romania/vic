import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import {
  BaseDocumentContractActionsArchiveEvent,
  BaseDocumentTemplateActionsArchiveEvent,
} from '../interfaces/document-contract-actions-archive-event.type';

export enum TrackedEventName {
  // Organization Profile
  UPDATE_ORGANIZATION_PROFILE = 'UPDATE_ORGANIZATION_PROFILE',

  // Organization Structure
  CREATE_ORGANIZATION_STRUCTURE = 'CREATE_ORGANIZATION_STRUCTURE',
  UPDATE_ORGANIZATION_STRUCTURE = 'UPDATE_ORGANIZATION_STRUCTURE',
  DELETE_ORGANIZATION_STRUCTURE = 'DELETE_ORGANIZATION_STRUCTURE',

  // Access Request
  APPROVE_ACCESS_REQUEST = 'APPROVE_ACCESS_REQUEST',
  REJECT_ACCESS_REQUEST = 'REJECT_ACCESS_REQUEST',
  DELETE_ACCESS_REQUEST = 'DELETE_ACCESS_REQUEST',

  // Volunteers
  CHANGE_VOLUNTEER_STATUS = 'CHANGE_VOLUNTEER_STATUS',
  UPDATE_VOLUNTEER_PROFILE = 'UPDATE_VOLUNTEER_PROFILE',

  // Activity Log
  REGISTER_ACTIVITY_LOG = 'REGISTER_ACTIVITY_LOG',
  CHANGE_ACTIVITY_LOG_STATUS = 'CHANGE_ACTIVITY_LOG_STATUS',

  // Activity Categories/Types
  CREATE_ACTIVITY_TYPE = 'CREATE_ACTIVITY_TYPE',
  UPDATE_ACTIVITY_TYPE = 'UPDATE_ACTIVITY_TYPE',
  CHANGE_ACTIVITY_TYPE_STATUS = 'CHANGE_ACTIVITY_TYPE_STATUS',

  // Events
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  CHANGE_EVENT_STATUS = 'CHANGE_EVENT_STATUS',

  // Announcements
  CREATE_ANNOUNCEMENT = 'CREATE_ANNOUNCEMENT',
  DELETE_ANNOUNCEMENT = 'DELETE_ANNOUNCEMENT',
  PUBLISH_ANNOUNCEMENT = 'PUBLISH_ANNOUNCEMENT',

  // Documents
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  APPROVE_CONTRACT = 'APPROVE_CONTRACT',
  REJECT_CONTRACT = 'REJECT_CONTRACT',

  // New Documents
  CREATE_DOCUMENT_CONTRACT = 'CREATE_DOCUMENT_CONTRACT',
  VALIDATE_DOCUMENT_CONTRACT = 'VALIDATE_DOCUMENT_CONTRACT',
  SIGN_DOCUMENT_CONTRACT_BY_NGO = 'SIGN_DOCUMENT_CONTRACT_BY_NGO',
  SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER = 'SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER',
  REJECT_DOCUMENT_CONTRACT_BY_NGO = 'REJECT_DOCUMENT_CONTRACT_BY_NGO',
  REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER = 'REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER',
  DELETE_DOCUMENT_CONTRACT = 'DELETE_DOCUMENT_CONTRACT',

  // New Templates
  CREATE_DOCUMENT_TEMPLATE = 'CREATE_DOCUMENT_TEMPLATE',
  UPDATE_DOCUMENT_TEMPLATE = 'UPDATE_DOCUMENT_TEMPLATE',
  DELETE_DOCUMENT_TEMPLATE = 'DELETE_DOCUMENT_TEMPLATE',
}

export interface TrackedEventData {
  // Organization Profile
  [TrackedEventName.UPDATE_ORGANIZATION_PROFILE]: {
    organizationId: string;
    organizationName: string;
  };

  // Organization Structure
  [TrackedEventName.CREATE_ORGANIZATION_STRUCTURE]: {
    organizationStructureName: string;
    organizationStructureId: string;
    organizationStructureType: OrganizationStructureType;
  };
  [TrackedEventName.UPDATE_ORGANIZATION_STRUCTURE]: {
    organizationStructureName: string;
    organizationStructureId: string;
    organizationStructureType: OrganizationStructureType;
  };
  [TrackedEventName.DELETE_ORGANIZATION_STRUCTURE]: {
    organizationStructureName: string;
    organizationStructureId: string;
    organizationStructureType: OrganizationStructureType;
  };

  // Access Requests
  [TrackedEventName.APPROVE_ACCESS_REQUEST]: {
    accessRequestId: string;
    userId: string;
    userName: string;
    volunteerId: string;
  };
  [TrackedEventName.REJECT_ACCESS_REQUEST]: {
    accessRequestId: string;
    userId: string;
    userName: string;
  };
  [TrackedEventName.DELETE_ACCESS_REQUEST]: {
    accessRequestId: string;
    userId: string;
    userName: string;
  };

  // Volunteers
  [TrackedEventName.CHANGE_VOLUNTEER_STATUS]: {
    volunteerId: string;
    volunteerName: string;
    oldStatus: VolunteerStatus;
    newStatus: VolunteerStatus;
  };
  [TrackedEventName.UPDATE_VOLUNTEER_PROFILE]: {
    volunteerId: string;
    volunteerName: string;
  };

  // Activity Log
  [TrackedEventName.REGISTER_ACTIVITY_LOG]: {
    activityLogId: string;
    volunteerId: string;
    volunteerName: string;
  };
  [TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS]: {
    activityLogId: string;
    volunteerId: string;
    volunteerName: string;
    oldStatus: ActivityLogStatus;
    newStatus: ActivityLogStatus;
  };

  // Activity Type
  [TrackedEventName.CREATE_ACTIVITY_TYPE]: {
    activityTypeId: string;
    activityTypeName: string;
  };
  [TrackedEventName.UPDATE_ACTIVITY_TYPE]: {
    activityTypeId: string;
    activityTypeName: string;
  };
  [TrackedEventName.CHANGE_ACTIVITY_TYPE_STATUS]: {
    activityTypeId: string;
    activityTypeName: string;
    oldStatus: ActivityTypeStatus;
    newStatus: ActivityTypeStatus;
  };

  // Events
  [TrackedEventName.CREATE_EVENT]: {
    eventId: string;
    eventName: string;
    status: EventStatus; // Folosit sa zicem "Eventul a fost creat cu statusul 'draft' sau 'published'"
  };
  [TrackedEventName.UPDATE_EVENT]: {
    eventId: string;
    eventName: string;
  };
  [TrackedEventName.DELETE_EVENT]: {
    eventId: string;
    eventName: string;
  };
  [TrackedEventName.CHANGE_EVENT_STATUS]: {
    eventId: string;
    eventName: string;
    oldStatus: EventStatus;
    newStatus: EventStatus;
  };

  // Announcement
  [TrackedEventName.CREATE_ANNOUNCEMENT]: {
    announcementId: string;
    announcementTitle: string;
    status: AnnouncementStatus;
  };
  [TrackedEventName.PUBLISH_ANNOUNCEMENT]: {
    announcementId: string;
    announcementTitle: string;
  };
  [TrackedEventName.DELETE_ANNOUNCEMENT]: {
    announcementId: string;
    announcementTitle: string;
  };

  // Documents
  [TrackedEventName.CREATE_CONTRACT]: {
    organizationId: string;
    organizationName: string;
    contractId: string;
    volunteerId: string;
    volunteerName: string;
    contractNumber: string;
  };
  [TrackedEventName.APPROVE_CONTRACT]: {
    organizationId: string;
    organizationName: string;
    contractId: string;
    oldStatus: ContractStatus;
    newStatus: ContractStatus;
    volunteerId: string;
    volunteerName: string;
    contractNumber: string;
  };
  [TrackedEventName.REJECT_CONTRACT]: {
    organizationId: string;
    organizationName: string;
    contractId: string;
    oldStatus: ContractStatus;
    newStatus: ContractStatus;
    volunteerId: string;
    volunteerName: string;
    contractNumber: string;
  };

  // New Documents
  [TrackedEventName.CREATE_DOCUMENT_CONTRACT]: BaseDocumentContractActionsArchiveEvent & {
    documentTemplateId: string;
    documentTemplateName: string;
  };
  [TrackedEventName.VALIDATE_DOCUMENT_CONTRACT]: BaseDocumentContractActionsArchiveEvent;
  [TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_NGO]: BaseDocumentContractActionsArchiveEvent;
  [TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER]: BaseDocumentContractActionsArchiveEvent;
  [TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_NGO]: BaseDocumentContractActionsArchiveEvent & {
    rejectionReason: string;
  };
  [TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER]: BaseDocumentContractActionsArchiveEvent & {
    rejectionReason: string;
  };
  [TrackedEventName.DELETE_DOCUMENT_CONTRACT]: BaseDocumentContractActionsArchiveEvent;

  // New Templates
  [TrackedEventName.CREATE_DOCUMENT_TEMPLATE]: BaseDocumentTemplateActionsArchiveEvent;
  [TrackedEventName.UPDATE_DOCUMENT_TEMPLATE]: BaseDocumentTemplateActionsArchiveEvent;
  [TrackedEventName.DELETE_DOCUMENT_TEMPLATE]: BaseDocumentTemplateActionsArchiveEvent;
}
