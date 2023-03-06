export enum OrganizationStructureType {
  BRANCH = 'branch',
  DEPARTMENT = 'department',
  ROLE = 'role',
}

export interface IEvent {
  id: string;
  logo?: string;
  name: string;
  location: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  targets: Array<{ id: string; name: string; type: OrganizationStructureType; members: number }>;
  targetedVolunteers: number;
  rsvp: { yes: number; no: number };
  displayStatus: 'draft' | 'published' | 'archived';
  reportedHours: string;
}
