import { Inject, Injectable } from '@nestjs/common';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import {
  IAdminUserModel,
  ICreateAdminUserModel,
} from '../models/admin-user.model';
import { IUserModel } from '../models/user.model';
import { AdminUserRepositoryService } from '../repositories/admin-user-repository.service';
import { UserRepositoryService } from '../repositories/user-repository.service';

@Injectable()
export class UserFacadeService {
  constructor(
    @Inject(AdminUserRepositoryService)
    private readonly adminUserRepository: IAdminUserRepository,
    @Inject(UserRepositoryService)
    private readonly userRepository: IUserRepository,
  ) {}

  public async getAdminUserByCognitoId(
    cognitoId: string,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.findByCognitoId(cognitoId);
  }

  public async getUserByOptions(
    options: Partial<IUserModel>,
  ): Promise<IUserModel> {
    return this.userRepository.findByOptions(options);
  }

  public async createAdmin(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.create(adminUserModel);
  }
}
