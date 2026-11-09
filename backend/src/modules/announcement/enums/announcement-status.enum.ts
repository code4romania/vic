// VIC 2.0 (#503): no drafts. An announcement is active or inactive (switched by the
// NGO) and archived by hand. Mobile shows only active ones inside their display period.
export enum AnnouncementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}
