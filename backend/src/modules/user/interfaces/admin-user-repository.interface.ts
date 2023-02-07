import {
  IAdminUserModel,
  ICreateAdminUserModel,
} from '../models/admin-user.model';

export interface IAdminUserRepository {
  create(userModel: ICreateAdminUserModel): Promise<IAdminUserModel>;
  findByCognitoId(cognitoId: string): Promise<IAdminUserModel>;
}
