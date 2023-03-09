import { DivisionType } from '../enums/division-type.enum';
import { EventStatus } from '../enums/event-status';

export interface IEvent {
  id: string;
  logo?: string;
  name: string;
  location?: string;
  description: string;
  mention?: string;
  observation?: string;
  startDate: Date;
  endDate?: Date;
  targets: Array<{ id: string; name: string; type: DivisionType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  status: EventStatus;
  reportedHours: string;
}
