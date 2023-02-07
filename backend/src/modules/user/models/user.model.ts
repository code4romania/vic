import { UserEntity } from '../entities/user.entity';
import { UserType } from '../enums/user-type.enum';

export interface IUserModel {
  id: string;
  cognitoId: string;
  type: UserType;
  name: string;
  email: string;
  phone: string;
}

export type ICreateUserModel = Omit<IUserModel, 'id'>;

export class UserTransformer {
  static fromEntity(userEntity: UserEntity): IUserModel {
    return {
      id: userEntity.id,
      cognitoId: userEntity.cognitoId,
      email: userEntity.email,
      phone: userEntity.phone,
      name: userEntity.name,
      type: userEntity.type,
    };
  }

  static toEntity(userModel: ICreateUserModel): UserEntity {
    const userEntity: UserEntity = new UserEntity();
    userEntity.name = userModel.name;
    userEntity.email = userModel.email;
    userEntity.phone = userModel.phone;
    userEntity.cognitoId = userModel.cognitoId;
    userEntity.type = userModel.type;
    return userEntity;
  }
}
