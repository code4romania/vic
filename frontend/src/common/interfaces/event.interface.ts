import { DivisionType } from '../enums/division-type.enum';
import { EventStatus } from '../enums/event-status';

export enum AttendanceType {
  SIMPLE = 'simple',
  MENTION = 'mention',
}

export interface IEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  logo?: string;
  isPublic: boolean;
  description: string;
  mention?: string;
  observation?: string;
  attendanceType: AttendanceType;
  attendanceMention: string;
  tasks: Array<{ id: string; name: string }>;
  targets: Array<{ id: string; name: string; type: DivisionType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  status: EventStatus;
  reportedHours: string;
}
