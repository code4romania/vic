import { IOrganizationListItem } from './organization-list-item.interface';

export interface IEventListItem {
  id: string;
  name: string;
  poster: string;
  location: string;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  eventInterval: string; // TODO: remove after deprecation
  organizationLogo?: string;
  targets?: IOrganizationListItem[];
}
