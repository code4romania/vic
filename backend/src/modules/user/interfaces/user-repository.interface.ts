import { IFindUserModel, IUserModel } from '../models/user.model';

export interface IUserRepository {
  find(options: Partial<IFindUserModel>): Promise<IUserModel>;
}
