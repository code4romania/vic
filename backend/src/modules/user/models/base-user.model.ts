import { Language } from '../enums/user.enum';

export interface IUserModel {
  id: string;
  cognitoId?: string; // legacy, null for users created after own auth; dropped at day 30
  name: string;
  email: string;
  phone: string;
  language?: Language | null; // null = not chosen yet
  // type: UserType;
}
