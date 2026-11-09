import { Sex } from '../enums/sex.enum';

export interface ICreateUserPayload {
  firstName: string;
  lastName: string;
  phone: string;
  locationId?: number;
  birthday?: Date;
  sex: Sex;
}
