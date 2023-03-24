import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';

export enum TrackedEventName {
  // Organization Profile
  UPDATE_ORGANIZATION_PROFILE = 'UPDATE_ORGANIZATION_PROFILE',

  // Organization Structure
  CREATE_ORGANIZATION_STRUCTURE = 'CREATE_ORGANIZATION_STRUCTURE',
  UPDATE_ORGANIZATION_STRUCTURE = 'UPDATE_ORGANIZATION_STRUCTURE',
  DELETE_ORGANIZATION_STRUCTURE = 'DELETE_ORGANIZATION_STRUCTURE',

  // Access Request
  APPROVE_ACCESS_REQUEST = 'APPROVE_ACCESS_REQUEST',
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
  [TrackedEventName.APPROVE_ACCESS_REQUEST]: {
    userId: string;
    userName: string;
    volunteerId: string;
  };
}
