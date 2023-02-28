import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { IDivision } from './division.interface';

export interface IAnnouncement {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  publishedOn: Date | null;
  targets: Omit<IDivision, 'createdBy' | 'createdOn'>[];
  updatedOn: Date;
  targetedVolunteers: number;
}
