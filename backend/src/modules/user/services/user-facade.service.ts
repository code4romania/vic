import { Inject, Injectable } from '@nestjs/common';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import {
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';
import { IFindUserModel, IUserModel } from '../models/user.model';
import { AdminUserRepositoryService } from '../repositories/admin-user.repository';
import { UserRepositoryService } from '../repositories/user.repository';

@Injectable()
export class UserFacadeService {
  constructor(
    @Inject(AdminUserRepositoryService)
    private readonly adminUserRepository: IAdminUserRepository,
    @Inject(UserRepositoryService)
    private readonly userRepository: IUserRepository,
  ) {}

  public async findAdminUser(
    optinos: IFindAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.find(optinos);
  }

  public async findUser(options: Partial<IFindUserModel>): Promise<IUserModel> {
    return this.userRepository.find(options);
  }

  public async createAdmin(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.create(adminUserModel);
  }
}
