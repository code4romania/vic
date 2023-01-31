import { UserEntity } from '../entities/user.entity';
import { IUserModel } from '../models/user.model';

export const toUserModel = (userEntity: UserEntity): IUserModel => {
  const userModel: IUserModel = {
    id: userEntity.id,
    cognitoId: userEntity.cognitoId,
    email: userEntity.email,
    phone: userEntity.phone,
    name: userEntity.name,
    type: userEntity.type,
  };
  return userModel;
};

export const toUserEntity = (userModel: Omit<IUserModel, 'id'>): UserEntity => {
  const userEntity: UserEntity = new UserEntity();
  userEntity.name = userModel.name;
  userEntity.email = userModel.email;
  userEntity.phone = userModel.phone;
  userEntity.cognitoId = userModel.cognitoId;
  userEntity.type = userModel.type;
  return userEntity;
};
