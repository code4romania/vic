// Status of a volunteer in one organization (VIC 2.0). Separate from whether
// the person has a VIC account (user.has_account).
export enum VolunteerStatus {
  ACTIVE = 'active',
  // Set manually by the NGO: hours, documents and contracts become read-only.
  INACTIVE = 'inactive',
  // Permanent blacklist: never changes back.
  BLOCKED = 'blocked',
  // Added by the NGO only: no email, no login, until the person signs up.
  CANDIDATE = 'candidate',
}

// Statuses whose hours, documents and contracts can still change.
export const EDITABLE_VOLUNTEER_STATUSES = [VolunteerStatus.ACTIVE];
