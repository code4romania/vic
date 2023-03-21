import { UpdateResourceEvent } from '../../events/base.events';

export enum ORGANIZATION_PROFILE_EVENTS {
  ALL = 'organizationProfile.*',
  UPDATE = 'organizationProfile.update',
}

export interface OrganizationProfileEventsMap {
  [ORGANIZATION_PROFILE_EVENTS.UPDATE]: UpdateResourceEvent;
}
