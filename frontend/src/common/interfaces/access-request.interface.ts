import { RequestStatus } from '../enums/request-status.enum';
import { IUser } from './user.interface';

export interface IQuestionAnswer {
  answer: string;
  question: string;
}

export interface IAccessRequest {
  id: string;
  createdOn: Date;
  updatedOn?: Date;
  rejectionReason?: string;
  requestedBy: IUser;
  status: RequestStatus;
  answers: IQuestionAnswer[];
}
