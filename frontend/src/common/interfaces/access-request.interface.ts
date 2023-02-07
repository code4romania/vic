import { Sex } from '../enums/sex.enum';

export interface IAccessRequest {
  id: string;
  name: string;
  logo: string;
  age: number;
  sex: Sex;
  location: string;
  email: string;
  phone: string;
  createdOn: Date;
  answers: string[];
}
