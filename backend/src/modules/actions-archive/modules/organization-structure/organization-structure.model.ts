import {
  CreateResourceEvent,
  UpdateResourceEvent,
  DeleteResourceEvent,
} from '../../events/base.events';

export enum ORGANIZATION_STRUCTURE_EVENTS {
  ALL = 'structure.*',
  CREATE = 'structure.createOrganizationStructure',
  EDIT = 'structure.editOrganizationStructure',
  DELETE = 'structure.deleteOrganizationStructure',
}

export interface OrganizationStructureEventsMap {
  [ORGANIZATION_STRUCTURE_EVENTS.CREATE]: CreateResourceEvent;
  [ORGANIZATION_STRUCTURE_EVENTS.EDIT]: UpdateResourceEvent;
  [ORGANIZATION_STRUCTURE_EVENTS.DELETE]: DeleteResourceEvent;
}
