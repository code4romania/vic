import { ActionsArchiveEntity } from '../entities/actions-archive.entity';

export enum ActionsArchiveType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ActionsResourceType {
  ORG_STRUCTURE = 'organization_structure',
  ORG_PROFILE = 'organization_profile',
  ACCESS_REQUEST = 'access_request',
  VOLUNTEERS = 'volunteers',
  ACTIVITY_LOG = 'activity_log',
  ACTIVITY_TYPE = 'activity_type',
  EVENTS = 'events',
  ANNOUNCEMENTS = 'announcements',
}

export type RegisterActionModel = {
  action: ActionsArchiveType;
  authorId: string;
  organizationId: string;
  resourceType: ActionsResourceType;
  resourceId: string;

  diff?: unknown;
};

export class ActionsArchiveTransformer {
  static toEntity(action: RegisterActionModel): ActionsArchiveEntity {
    const entity = new ActionsArchiveEntity();

    entity.action = action.action;
    entity.authorId = action.authorId;
    entity.organizationId = action.organizationId;
    entity.resourceType = action.resourceType;
    entity.resourceId = action.resourceId;

    entity.diff = action.diff;

    return entity;
  }
}
