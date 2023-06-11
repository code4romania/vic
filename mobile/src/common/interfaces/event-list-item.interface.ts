import { IOrganizationListItem } from './organization-list-item.interface';

export interface IEventListItem {
  id: string;
  name: string;
  image: string;
  location: string;
  isPublic: boolean;
  eventInterval: string;
  organizationLogo?: string;
  targets?: IOrganizationListItem[];
}
