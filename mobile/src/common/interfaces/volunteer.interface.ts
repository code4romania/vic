import { IUserProfile } from './user-profile.interface';

export interface IVolunteer {
  id: string;
  status: string;
  user: IUserProfile;
}
