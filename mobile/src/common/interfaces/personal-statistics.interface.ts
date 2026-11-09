// Redesigned Profil: the volunteer's own totals, across organizations.
export interface IPersonalStatistics {
  approvedHours: number;
  events: number;
  // ISO date the VIC account was created
  memberSince: string | null;
  // full years since memberSince (0 in the first year)
  yearsInVic: number;
}
