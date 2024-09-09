import { NotificationsFrom } from '../enums/notifications-from.enum';
import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';
import { IOrganizationVolunteer } from './organization-list-item.interface';

export interface IUserPersonalData {
  id: string;
  identityDocumentCNP: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
  identityDocumentIssuedBy: string;
}

export interface ILegalGuardianData {
  name: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  email: string;
  phone: string;
}

export interface INotificationsSettings {
  id: string;
  notificationsFrom: NotificationsFrom;
  notificationsViaEmail: boolean;
  notificationsViaPush: boolean;
}

export interface IUserProfile {
  id: string;
  email: string;
  phone?: string;
  age: number;
  sex: Sex;
  location?: ICity;
  userPersonalData: IUserPersonalData;
  legalGuardianData?: ILegalGuardianData;
  activeOrganization: IOrganizationVolunteer | null;
  myOrganizations: IOrganizationVolunteer[];
  profilePicture?: string;
  firstName: string;
  lastName: string;
  birthday?: Date;
  notificationsSettings: INotificationsSettings;
}
