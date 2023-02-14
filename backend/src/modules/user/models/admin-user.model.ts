import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { AdminUserEntity } from '../entities/user.entity';

export interface IUserModel {
  id: string;
  cognitoId: string;
  name: string;
  email: string;
  phone: string;
  // type: UserType;
}

export interface IAdminUserModel extends IUserModel {
  organizationId: string;
}

export type ICreateAdminUserModel = Omit<IAdminUserModel, 'id'>;

export type IFindAdminUserModel =
  | Partial<IAdminUserModel>
  | ArrayOfPropetyType<IAdminUserModel>;

export class AdminUserTransformer {
  static fromEntity(entity: AdminUserEntity): IAdminUserModel {
    return {
      id: entity.id,
      cognitoId: entity.cognitoId,
      email: entity.email,
      phone: entity.phone,
      name: entity.name,
      organizationId: entity.organizationId,
    };
  }

  static toEntity(model: ICreateAdminUserModel): AdminUserEntity {
    const entity = new AdminUserEntity();
    entity.cognitoId = model.cognitoId;
    entity.name = model.name;
    entity.email = model.email;
    entity.phone = model.phone;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
