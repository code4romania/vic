import { AttendanceType } from '../enums/attendance-type.enum';
import { DivisionType } from '../enums/division-type.enum';
import { EventStatus } from '../enums/event-status';

export interface IEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  logo?: string;
  isPublic: boolean;
  description: string;
  observation?: string;
  attendanceType: AttendanceType;
  attendanceMention: string;
  tasks: Array<{ id: string; name: string }>;
  targets: Array<{ id: string; name: string; type: DivisionType; members: number }>;
  rsvp: { yes: number; no: number };
  status: EventStatus;
  reportedHours: string;
}
