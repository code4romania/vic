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
  createdOn: Date;
  updatedOn: Date;
}
