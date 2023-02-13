import { Inject, Injectable } from '@nestjs/common';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import {
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';
import { AdminUserRepositoryService } from '../repositories/admin-user.repository';

@Injectable()
export class UserFacadeService {
  constructor(
    @Inject(AdminUserRepositoryService)
    private readonly adminUserRepository: IAdminUserRepository,
  ) {}

  public async findAdminUser(
    options: IFindAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.find(options);
  }

  public async createAdmin(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.create(adminUserModel);
  }
}
