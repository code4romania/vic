import { UserType } from '../enums/user-type.enum';

export interface IUserModel {
  id: string;
  cognitoId: string;
  type: UserType;
  name: string;
  email: string;
  phone: string;
}
