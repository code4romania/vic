export enum OrganizatinVolunteerStatus {
  ACCESS_REQUEST_PENDING = 'ACCESS_REQUEST_PENDING',
  ACTIVE_VOLUNTEER = 'ACTIVE_VOLUNTEER',
  // Left the organization by themselves: can rejoin
  ARCHIVED_VOLUNTEER = 'ARCHIVED_VOLUNTEER',
  // Made inactive by the organization: read-only (view the NGO, download documents)
  INACTIVE_VOLUNTEER = 'INACTIVE_VOLUNTEER',
  BLOCKED_VOLUNTEER = 'BLOCKED_VOLUNTEER',
  // Added by the organization before the volunteer had an account
  CANDIDATE_VOLUNTEER = 'CANDIDATE_VOLUNTEER',
}
