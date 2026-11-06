export type TeamMemberStatus =
  | 'active'
  | 'invite_sent'
  | 'invite_expired'
  | 'disabled'
  | 'no_login';

// GET /organization/team
export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TeamMemberStatus;
  inviteExpiresAt: string | null;
  lastInviteSentAt: string | null;
  // Null for the cutover transition link.
  lastInviteSentBy: string | null;
  lastLoginAt: string | null;
}

export interface IAddAdmin {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
