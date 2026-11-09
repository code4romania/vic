import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IDivisionListItem } from './division.interface';
import { IUser } from './user.interface';

export interface IVolunteer {
  id: string;
  createdOn: Date;
  updatedOn: Date;
  user: IUser;
  status: VolunteerStatus;
  source?: string | null;
  // Internal notes of the organization (#471)
  notes?: string | null;
  isFavorite: boolean;
  // Approved hours in the organization; only in the volunteers list (#475).
  totalHours?: number;
  archivedOn?: Date;
  blockedOn?: Date;
  archivedBy?: Pick<IUser, 'id' | 'name'>;
  blockedBy?: Pick<IUser, 'id' | 'name'>;
  organizationId: string;
  profile?: IVolunteerProfile;
}

// POST /volunteer/import (#473)
export interface IImportVolunteersResult {
  imported: number;
  skipped: { row: number; email: string; reason: 'already_volunteer' | 'duplicate_in_file' }[];
  errors: { row: number; reasons: string[] }[];
}

interface IVolunteerProfile {
  email: string;
  activeSince: Date;
  role?: IDivisionListItem;
  department?: IDivisionListItem;
  branch?: IDivisionListItem;
}
//TO DO: create interface for achivedBy and blockedBy
