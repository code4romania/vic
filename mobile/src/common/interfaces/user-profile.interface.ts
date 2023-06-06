import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';
import { IOrganizationListItem } from './organization-list-item.interface';

export interface IUserPersonalData {
  id: string;
  identityDocumentSeries: string;
  identityDocumentNumber: number;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthday: Date;
  sex: Sex;
  location?: ICity;
  userPersonalData: IUserPersonalData;
  activeOrganization: IOrganizationListItem;
}
