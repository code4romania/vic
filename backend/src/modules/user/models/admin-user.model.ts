import { AdminUserEntity } from '../entities/admin-user.entity';
import { UserType } from '../enums/user-type.enum';
import { ICreateUserModel, IUserModel, UserTransformer } from './user.model';

export interface IAdminUserModel extends IUserModel {
  organizationId: string;
}

export type ICreateAdminUserModel = Omit<ICreateUserModel, 'type'> & {
  organizationId: string;
};

export class AdminUserTransformer {
  static fromEntity(entity: AdminUserEntity): IAdminUserModel {
    const { organizationId, user } = entity;
    return {
      ...UserTransformer.fromEntity(user),
      organizationId,
    };
  }

  static toEntity(model: ICreateAdminUserModel): AdminUserEntity {
    // create user entity
    const { organizationId, ...userModel } = model;
    const userEntity = UserTransformer.toEntity({
      ...userModel,
      type: UserType.ADMIN,
    });
    // create admin entity
    const entity = new AdminUserEntity();
    entity.organizationId = organizationId;
    entity.user = userEntity;
    return entity;
  }
}
