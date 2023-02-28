import { AdminUserEntity } from '../entities/user.entity';
import { IUserModel } from './base-user.model';

export interface IAdminUserModel extends IUserModel {
  organizationId: string;
}

export type ICreateAdminUserModel = Omit<IAdminUserModel, 'id'>;

export type IFindAdminUserModel =
  | Partial<IAdminUserModel>
  | Partial<IAdminUserModel>[];

export class AdminUserTransformer {
  static fromEntity(entity: AdminUserEntity): IAdminUserModel {
    if (!entity) return null;
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
