import { AttendanceType } from '../enums/attendance-type.enum';
import { EventStatus } from '../enums/event-status';
import { IDivisionListItem } from './division.interface';

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
  tasks: IDivisionListItem[];
  targets: IDivisionListItem[];
  rsvp: { yes: number; no: number };
  status: EventStatus;
  going?: number;
  notGoing?: number;
}
