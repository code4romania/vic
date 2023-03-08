export enum OrganizationStructureType {
  BRANCH = 'branch',
  DEPARTMENT = 'department',
  ROLE = 'role',
}

export interface IEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  logo?: string;
  description: string;
  mention?: string;
  observation?: string;
  targets: Array<{ id: string; name: string; type: OrganizationStructureType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  displayStatus: 'draft' | 'published' | 'archived';
  reportedHours: string;
}
