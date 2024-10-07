import { AdminUserEntity, UserEntity } from '../entities/user.entity';
import { UserType } from '../enums/user.enum';

export interface IUserModel {
  id: string;
  cognitoId: string;
  name: string;
  email: string;
  phone: string;
  // type: UserType;
}

export interface ICommonUserModel extends IUserModel {
  type: UserType;
}

export class BaseUserTransformer {
  static fromEntity(entity: UserEntity): ICommonUserModel {
    if (!entity) return null;

    return {
      id: entity.id,
      cognitoId: entity.cognitoId,
      email: entity.email,
      type:
        entity instanceof AdminUserEntity ? UserType.ADMIN : UserType.REGULAR,
      name: entity.name,
      phone: entity.phone,
    };
  }
}
