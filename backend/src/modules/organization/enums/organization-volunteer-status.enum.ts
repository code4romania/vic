export enum OrganizatinVolunteerStatus {
  ACCESS_REQUEST_PENDING = 'ACCESS_REQUEST_PENDING',
  ACTIVE_VOLUNTEER = 'ACTIVE_VOLUNTEER',
  // The volunteer left the organization themselves: they can ask to rejoin.
  ARCHIVED_VOLUNTEER = 'ARCHIVED_VOLUNTEER',
  // The organization made the volunteer inactive: read-only (view the NGO, download documents).
  INACTIVE_VOLUNTEER = 'INACTIVE_VOLUNTEER',
  BLOCKED_VOLUNTEER = 'BLOCKED_VOLUNTEER',
  // Added by the NGO before the person had an account; the NGO activates them.
  CANDIDATE_VOLUNTEER = 'CANDIDATE_VOLUNTEER',
}
