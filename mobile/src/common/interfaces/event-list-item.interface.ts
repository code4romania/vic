import { IOrganizationListItem } from './organization-list-item.interface';

export interface IEventListItem {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  image: string;
  isPublic: boolean;
  eventInterval: string;
  organizationLogo?: string;
  targets?: IOrganizationListItem[];
}
