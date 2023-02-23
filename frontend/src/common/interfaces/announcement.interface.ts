import { IDivision } from '../../components/Divisions';
import { AnnouncementStatus } from '../enums/announcement-status.enum';

export interface IAnnouncement {
  id: string;
  name: string;
  description: string;
  status: AnnouncementStatus;
  publishedOn: Date | null;
  targets: Omit<IDivision, 'createdBy' | 'createdOn'>[];
  updatedOn: Date;
}
