import { IUserModel } from '../models/user.model';

export interface IUserRepository {
  findByOptions(options: Partial<IUserModel>): Promise<IUserModel>;
}
