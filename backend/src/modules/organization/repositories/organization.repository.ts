import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  OrganizationTransformer,
} from '../models/organization.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

@Injectable()
export class OrganizationRepositoryService
  extends RepositoryWithPagination<OrganizationEntity>
  implements IOrganizationRepository
{
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {
    super(organizationRepository);
  }

  public async create(
    organization: ICreateOrganizationModel,
  ): Promise<IOrganizationModel> {
    // create organization entity
    const newOrganizationEntity =
      OrganizationTransformer.toEntity(organization);

    // save organization entity
    const organizationEntity = await this.organizationRepository.save(
      newOrganizationEntity,
    );

    // return organization model
    return OrganizationTransformer.fromEntity(organizationEntity);
  }

  public async update(
    id: string,
    description: string,
  ): Promise<IOrganizationModel> {
    // update organization entity
    await this.organizationRepository.update({ id }, { description });

    // return organization model
    return this.find({ id });
  }

  public async find(
    options:
      | Partial<IFindOrganizationModel>
      | ArrayOfPropetyType<IFindOrganizationModel>,
  ): Promise<IOrganizationModel> {
    // get organization entity by id
    const organizationEntity = await this.organizationRepository.findOne({
      where: options,
    });

    // return organization model
    return organizationEntity
      ? OrganizationTransformer.fromEntity(organizationEntity)
      : null;
  }

  public async findMany(
    findOptions: IBasePaginationFilterModel,
  ): Promise<Pagination<IOrganizationModel>> {
    const { orderBy, orderDirection } = findOptions;

    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .select()
      .orderBy(
        this.buildOrderByQuery(orderBy || 'name', 'organization'),
        orderDirection || OrderDirection.ASC,
      );

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      OrganizationTransformer.fromEntity,
    );
  }
}
