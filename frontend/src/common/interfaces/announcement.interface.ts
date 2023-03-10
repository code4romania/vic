import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { IDivisionListItem } from './division.interface';

export interface IAnnouncement {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  publishedOn?: Date;
  targets: IDivisionListItem[];
  updatedOn: Date;
  targetedVolunteers: number;
}
