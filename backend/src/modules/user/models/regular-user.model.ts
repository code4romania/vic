import { ICityModel } from 'src/modules/location/model/city.model';
import { RegularUserEntity } from '../entities/user.entity';
import { SEX } from '../enums/user.enum';
import { IUserModel } from './base-user.model';

export interface IRegularUserModel extends IUserModel {
  birthday: Date;
  sex: SEX;
  profilePicture?: string;
  location: ICityModel;
}

export type CreateRegularUserOptions = Omit<
  IRegularUserModel,
  'id' | 'location'
> & {
  locationId: number;
};

export type FindRegularUserOptions =
  | Partial<IRegularUserModel & { locationId: number }>
  | Partial<IRegularUserModel & { locationId: number }>[];

export class RegularUserTransformer {
  static fromEntity(entity: RegularUserEntity): IRegularUserModel {
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
    };
  }

  static toEntity(model: CreateRegularUserOptions): RegularUserEntity {
    const entity = new RegularUserEntity();
    entity.cognitoId = model.cognitoId;
    entity.name = model.name;
    entity.email = model.email;
    entity.phone = model.phone;
    entity.birthday = model.birthday;
    entity.sex = model.sex;
    entity.locationId = model.locationId;
    return entity;
  }
}
