import { AttendanceType } from '../enums/attendance-type.enum';
import { EventStatus } from '../enums/event-status';
import { IDivisionListItem } from './division.interface';

export interface IEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  image?: string;
  isPublic: boolean;
  description: string;
  observation?: string;
  attendanceType: AttendanceType;
  attendanceMention: string;
  tasks: IDivisionListItem[];
  targets: IDivisionListItem[];
  status: EventStatus;
  going?: number;
  notGoing?: number;
  activityLogged?: { totalHours: number; volunteers: number };
}
