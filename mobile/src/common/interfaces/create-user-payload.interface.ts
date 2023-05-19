import { Sex } from '../enums/sex.enum';

export interface ICreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locationId?: number;
  birthday?: Date;
  sex: Sex;
}
