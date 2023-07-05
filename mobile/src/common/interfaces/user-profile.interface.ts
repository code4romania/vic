import { NotificationsFrom } from '../enums/notifications-from.enum';
import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';
import { IOrganizationVolunteer } from './organization-list-item.interface';

export interface IUserPersonalData {
  id: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
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
  activeOrganization: IOrganizationVolunteer | null;
  myOrganizations: IOrganizationVolunteer[];
  profilePicture?: string;
  firstName: string;
  lastName: string;
  birthday?: Date;
  notificationsSettings: INotificationsSettings;
}
