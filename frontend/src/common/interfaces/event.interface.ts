import { EventDisplayStatus, EventStatus } from '../enums/event-status';
import { IDivisionListItem } from './division.interface';

export interface IEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isPublic: boolean;
  description: string;
  targets: IDivisionListItem[];
  status: EventStatus;
  // What to show: a published event past its end date is "finished" (Finalizat)
  displayStatus: EventDisplayStatus;
  // Maximum number of registered volunteers; null = no limit
  capacity?: number | null;
  going?: number;
  notGoing?: number;
  activityLogged?: { totalHours: number; volunteers: number };
}
