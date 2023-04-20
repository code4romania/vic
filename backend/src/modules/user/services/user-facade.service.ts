import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyAdminUserOptions,
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';
import {
  CreateRegularUserOptions,
  FindRegularUserOptions,
  IRegularUserModel,
} from '../models/regular-user.model';
import { AdminUserRepositoryService } from '../repositories/admin-user.repository';
import { RegularUserRepositoryService } from '../repositories/regular-user.repository';

@Injectable()
export class UserFacadeService {
  constructor(
    private readonly adminUserRepository: AdminUserRepositoryService,
    private readonly regularUserRepository: RegularUserRepositoryService,
  ) {}

  public async findAdminUser(
    options: IFindAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.find(options);
  }

  public async findManyAdminUsers(
    options: FindManyAdminUserOptions,
  ): Promise<Pagination<IAdminUserModel>> {
    return this.adminUserRepository.findMany(options);
  }

  public async createAdmin(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.create(adminUserModel);
  }

  public async createRegularUser(
    regularUser: CreateRegularUserOptions,
  ): Promise<IRegularUserModel> {
    return this.regularUserRepository.create(regularUser);
  }

  public async findRegularUser(
    options: FindRegularUserOptions,
  ): Promise<IRegularUserModel> {
    return this.regularUserRepository.find(options);
  }
}
