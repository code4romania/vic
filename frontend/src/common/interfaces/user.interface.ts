import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  location: ICity;
  age: number;
  sex: Sex;
  // False for a person added by the organization who has no VIC account yet
  hasAccount?: boolean;
  createdOn: Date;
  updatedOn: Date;
}
