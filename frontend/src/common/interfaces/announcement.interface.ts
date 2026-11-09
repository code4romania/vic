import { AnnouncementStatus, AnnouncementType } from '../enums/announcement-status.enum';

export interface IAnnouncement {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  type: AnnouncementType;
  volunteersNeeded?: number | null;
  // Shown in the mobile app only between these dates (no end date = open-ended)
  displayStartDate: Date;
  displayEndDate?: Date | null;
  publishedOn?: Date;
  archivedOn?: Date | null;
  updatedOn: Date;
  targetedVolunteers: number;
}
