import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';

export interface IUserPersonalDataModel {
  id: string;
  cnp: string;
  address: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
  identityDocumentIssuedBy: string;
  legalGuardian?: LegalGuardianIdentityData;
}

export interface LegalGuardianIdentityData {
  name: string;
  cnp: string;
  address: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  email: string;
  phone: string;
}

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

  userPersonalData?: IUserPersonalDataModel;
}
