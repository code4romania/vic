import { NotificationsFrom } from '../enums/notifications-from.enum';
import { Sex } from '../enums/sex.enum';
import { ICity } from './city.interface';
import { IOrganizationVolunteer } from './organization-list-item.interface';

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
  activeOrganization: IOrganizationVolunteer | null;
  myOrganizations: IOrganizationVolunteer[];
  profilePicture?: string;
  firstName: string;
  lastName: string;
  // Mandatory since VIC 2.0; older accounts may not have it yet
  birthday?: Date;
  notificationsSettings: INotificationsSettings;
}
