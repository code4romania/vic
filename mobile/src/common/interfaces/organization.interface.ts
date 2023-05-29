import { OrganizatinVolunteerStatus } from '../enums/organization-volunteer-status.enum';
import { IEventListItem } from './event-list-item.interface';

export interface IOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  logo: string;
  description: string;
  numberOfVolunteers: number;
  events: IEventListItem[];
  organizationVolunteerStatus?: OrganizatinVolunteerStatus;
}
