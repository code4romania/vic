import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../entities/user.entity';
import { IAdminUserRepository } from '../interfaces/admin-user-repository.interface';
import {
  AdminUserTransformer,
  FindManyAdminUserOptions,
  IAdminUserModel,
  ICreateAdminUserModel,
  IFindAdminUserModel,
} from '../models/admin-user.model';

@Injectable()
export class AdminUserRepositoryService
  extends RepositoryWithPagination<AdminUserEntity>
  implements IAdminUserRepository
{
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {
    super(adminUserRepository);
  }

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

  async find(options: IFindAdminUserModel): Promise<IAdminUserModel> {
    const userEntity = await this.adminUserRepository.findOne({
      where: options,
    });

    // return user model
    return userEntity ? AdminUserTransformer.fromEntity(userEntity) : null;
  }

  async findMany(
    findOptions: FindManyAdminUserOptions,
  ): Promise<Pagination<IAdminUserModel>> {
    const query = this.adminUserRepository
      .createQueryBuilder('user')
      .select()
      .where('user.organizationId = :organizationId', {
        organizationId: findOptions.organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(findOptions.orderBy || 'createdOn', 'user'),
        findOptions.orderDirection || OrderDirection.DESC,
      );

    if (findOptions.search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['user.name', 'user.email'],
          findOptions.search,
        ),
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      AdminUserTransformer.fromEntity,
    );
  }
}
