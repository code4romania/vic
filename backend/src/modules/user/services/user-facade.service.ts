import { Inject, Injectable } from '@nestjs/common';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import {
  IAdminUserModel,
  ICreateAdminUserModel,
} from '../models/admin-user.model';
import { AdminUserRepositoryService } from '../repositories/admin-user-repository.service';

@Injectable()
export class UserFacadeService {
  constructor(
    @Inject(AdminUserRepositoryService)
    private readonly adminUserRepository: IAdminUserRepository,
  ) {}

  public async getAdminUserByCognitoId(
    cognitoId: string,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.findByCognitoId(cognitoId);
  }

  public async createAdmin(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    return this.adminUserRepository.create(adminUserModel);
  }
}
