import { IOrganizationListItem } from './organization-list-item.interface';

export interface IEventListItem {
  id: string;
  name: string;
  // Maximum number of registered volunteers; null = no limit (VIC 2.0)
  capacity?: number | null;
  // 'finished' once a published event is past its end date
  displayStatus?: 'draft' | 'published' | 'finished' | 'archived';
  location: string;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  eventInterval: string; // TODO: remove after deprecation
  organizationLogo?: string;
  // redesigned list cards: the organization and an "Înscris" badge
  organizationId?: string;
  organizationName?: string;
  isGoing?: boolean;
  targets?: IOrganizationListItem[];
}
