import { RequestStatus } from '../enums/request-status.enum';
import { Sex } from '../enums/sex.enum';
import { IUser } from './user.interface';

export interface IAccessRequestDetails {
  id: string;
  name: string;
  logo: string;
  age: number;
  sex: Sex;
  status: RequestStatus;
  location: string;
  email: string;
  phone: string;
  createdOn: Date;
  answers: string[];
}

export interface IAccessRequest {
  id: string;
  createdOn: Date;
  updatedOn?: Date;
  rejectionReason?: string;
  requestedBy: IUser;
}
