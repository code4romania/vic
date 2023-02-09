import {
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';

export interface IAdminUserRepository {
  create(userModel: ICreateAdminUserModel): Promise<IAdminUserModel>;
  find(findOptions: IFindAdminUserModel): Promise<IAdminUserModel>;
}
