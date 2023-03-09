export enum OrganizationStructureType {
  BRANCH = 'branch',
  DEPARTMENT = 'department',
  ROLE = 'role',
}

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
  targets: Array<{ id: string; name: string; type: OrganizationStructureType; members: number }>;
  tasks: Array<{ id: string; name: string }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  status: 'draft' | 'published' | 'archived';
  reportedHours: string;
}
