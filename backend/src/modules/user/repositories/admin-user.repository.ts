import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../entities/user.entity';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import {
  AdminUserTransformer,
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';

@Injectable()
export class AdminUserRepositoryService implements IAdminUserRepository {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {}

  async create(
    adminUserModel: ICreateAdminUserModel,
  ): Promise<IAdminUserModel> {
    // create  admin user  entity
    const newAdminUserEntity = AdminUserTransformer.toEntity(adminUserModel);

    // save admin user entity
    const adminUserEntity = await this.adminUserRepository.save(
      newAdminUserEntity,
    );

    // return organization model
    return AdminUserTransformer.fromEntity(adminUserEntity);
  }

  public async find(options: IFindAdminUserModel): Promise<IAdminUserModel> {
    const userEntity = await this.adminUserRepository.findOne({
      where: { ...options },
    });

    // return user model
    return userEntity ? AdminUserTransformer.fromEntity(userEntity) : null;
  }
}
