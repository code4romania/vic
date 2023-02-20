import { Sex } from '../enums/sex.enum';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address?: string;
  birthday: Date;
  sex: Sex;
  createdOn: Date;
  updatedOn: Date;
}
