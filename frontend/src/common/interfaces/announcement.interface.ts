import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { IDivisionListItem } from './division.interface';

export interface IAnnouncement {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  publishedOn: Date | null;
  targets: IDivisionListItem[];
  updatedOn: Date;
  targetedVolunteers: number;
}

export interface ISaveAnnouncement {
  name: string;
  description: string;
  status: AnnouncementStatus;
  targetsIds: string[];
}
