import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

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
}
