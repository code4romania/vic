import { OrganizationProfileEventsMap } from '../modules/organization-profile/organization-profile.model';
import { OrganizationStructureEventsMap } from '../modules/organization-structure/organization-structure.model';

export interface ActionsArchiveEventsMap
  extends OrganizationStructureEventsMap,
    OrganizationProfileEventsMap {}
