export enum OrganizationStructureType {
  BRANCH = 'branch',
  DEPARTMENT = 'department',
  ROLE = 'role',
}

export interface IEvent {
  name: string;
  startDate: Date;
  endDate?: Date;
  target: Array<{ id: string; name: string; type: OrganizationStructureType; members: number }>;
  rsvp: { yes: number; no: number };
  displayStatus: 'draft' | 'published' | 'archived';
  reportedHours: string;
}
