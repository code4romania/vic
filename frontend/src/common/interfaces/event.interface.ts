import { DivisionType } from '../enums/division-type.enum';
import { EventStatus } from '../enums/event-status';

export interface IEvent {
  logo?: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  targets: Array<{ id: string; name: string; type: DivisionType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  status: EventStatus;
  reportedHours: string;
}
