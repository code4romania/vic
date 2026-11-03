import { EntityManager } from 'typeorm';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyAdminUserOptions,
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';

export interface IAdminUserRepository {
  create(
    userModel: ICreateAdminUserModel,
    manager?: EntityManager,
  ): Promise<IAdminUserModel>;
  find(findOptions: IFindAdminUserModel): Promise<IAdminUserModel>;
  findMany(
    findManyOptions: FindManyAdminUserOptions,
  ): Promise<Pagination<IAdminUserModel>>;
}
