import { ICityModel } from 'src/modules/location/model/city.model';
import { RegularUserEntity } from '../entities/user.entity';
import { SEX } from '../enums/user.enum';
import { IUserModel } from './base-user.model';
import {
  IUserPersonalDataModel,
  UserPersonalDataTransformer,
} from './user-personal-data.model';
import {
  IOrganizationVolunteerModel,
  OrganizationVolunteerTransformer,
} from 'src/modules/organization/models/organization-volunteer.models';
import {
  INotificationsSettingsModel,
  NotificationsSettingsTransformer,
} from 'src/modules/notifications/models/notifications-settings.model';

export interface IRegularUserModel extends IUserModel {
  birthday: Date;
  sex: SEX;
  profilePicture?: string;
  location: ICityModel;
  firstName: string;
  lastName: string;
  userPersonalData?: IUserPersonalDataModel;
  activeOrganization?: IOrganizationVolunteerModel;
  notificationsSettings: INotificationsSettingsModel;
}

export interface IRegularUserProfileModel extends IRegularUserModel {
  myOrganizations: IOrganizationVolunteerModel[];
}

export type CreateRegularUserOptions = Omit<
  IRegularUserModel,
  'id' | 'location' | 'name' | 'notificationsSettings'
> & {
  locationId: number;
  notificationsSettingsId?: string;
};

export type UpdateRegularUserOptions = Partial<
  Pick<
    IRegularUserModel,
    | 'userPersonalData'
    | 'firstName'
    | 'lastName'
    | 'birthday'
    | 'phone'
    | 'sex'
    | 'profilePicture'
  >
> & {
  activeOrganizationId?: string;
  locationId?: number;
};

export type FindRegularUserOptions =
  | Partial<IRegularUserModel & { locationId: number }>
  | Partial<IRegularUserModel & { locationId: number }>[];

export type FindOneRegularUserOptions = Partial<
  Pick<IUserModel, 'id' | 'cognitoId'>
>;
export class RegularUserTransformer {
  static fromEntity(entity: RegularUserEntity): IRegularUserModel {
    if (!entity) return null;
    return {
      id: entity.id,
      cognitoId: entity.cognitoId,
      email: entity.email,
      phone: entity.phone,
      name: entity.name,
      birthday: entity.birthday,
      sex: entity.sex,
      profilePicture: entity.profilePicture,
      location: entity.location,
      firstName: entity.firstName,
      lastName: entity.lastName,
      userPersonalData: UserPersonalDataTransformer.fromEntity(
        entity.userPersonalData,
      ),
      activeOrganization: OrganizationVolunteerTransformer.fromEntity(
        entity.activeOrganization,
      ),
      notificationsSettings: NotificationsSettingsTransformer.fromEntity(
        entity.notificationsSettings,
      ),
    };
  }

  static toEntity(model: CreateRegularUserOptions): RegularUserEntity {
    const entity = new RegularUserEntity();
    entity.cognitoId = model.cognitoId;
    entity.name = `${model.firstName} ${model.lastName}`;
    entity.email = model.email;
    entity.phone = model.phone;
    entity.birthday = model.birthday;
    entity.sex = model.sex;
    entity.locationId = model.locationId;
    entity.firstName = model.firstName;
    entity.lastName = model.lastName;
    entity.notificationsSettingsId = model.notificationsSettingsId;
    return entity;
  }
}
