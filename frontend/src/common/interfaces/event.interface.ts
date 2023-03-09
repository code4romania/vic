import { DivisionType } from '../enums/division-type.enum';

export interface IEvent {
  logo?: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  targets: Array<{ id: string; name: string; type: DivisionType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  displayStatus: 'draft' | 'published' | 'archived';
  reportedHours: string;
}
