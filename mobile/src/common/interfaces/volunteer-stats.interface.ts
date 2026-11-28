export interface IVolunteerStats {
  volunteerId: string;
  activityLogCount: number;
  // signed contracts still in their period
  signedContractCount?: number;
  volunteerProfileId: string | null;
}
