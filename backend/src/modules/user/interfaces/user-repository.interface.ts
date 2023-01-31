import { IUserModel } from '../models/user.model';

export interface IUserRepository {
  create(userModel: Omit<IUserModel, 'id'>): Promise<IUserModel>;
  findById(id: string): Promise<IUserModel>;
}
