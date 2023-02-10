import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../entities/admin-user.entity';
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

  public async find(
    options: Partial<IFindAdminUserModel>,
  ): Promise<IAdminUserModel> {
    // separate the user conditions from the admin user conditions
    const { organizationId, id, ...user } = options;

    const userEntity = await this.adminUserRepository.findOne({
      where: {
        user,
        organizationId,
        id,
      },
      relations: {
        user: true,
      },
    });

    // return user model
    return userEntity ? AdminUserTransformer.fromEntity(userEntity) : null;
  }
}
