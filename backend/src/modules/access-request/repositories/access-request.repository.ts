import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AccessRequestEntity } from '../entities/access-request.entity';
import { IAccessRequestRepository } from '../interfaces/access-request-repository.interface';
import {
  AccessRequestTransformer,
  CreateAccessRequestModel,
  FindAccessRequestOptions,
  FindManyAccessRequestsOptions,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';

@Injectable()
export class AccessRequestRepository
  extends RepositoryWithPagination<AccessRequestEntity>
  implements IAccessRequestRepository
{
  constructor(
    @InjectRepository(AccessRequestEntity)
    private readonly accessRequestRepository: Repository<AccessRequestEntity>,
  ) {
    super(accessRequestRepository);
  }

  async findMany(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<Pagination<IAccessRequestModel>> {
    const options: {
      filters: FindOptionsWhere<AccessRequestEntity>;
    } & IBasePaginationFilterModel = {
      ...findOptions,
      filters: {
        status: findOptions.status,
        organizationId: findOptions.organizationId,
        ...(findOptions.locationId
          ? {
              requestedBy: {
                locationId: findOptions.locationId,
              },
            }
          : {}),
      },
    };

    return this.findManyPaginated<IAccessRequestModel>(
      {
        searchableColumns: [
          'requestedBy.name',
          'requestedBy.email',
          'requestedBy.phone',
        ],
        defaultSortBy: 'createdOn',
        defaultOrderDirection: OrderDirection.DESC,
        relations: {
          updatedBy: true,
          requestedBy: {
            location: {
              county: true,
            },
          },
        },
        rangeColumn: 'createdOn',
      },
      options,
      AccessRequestTransformer.fromEntity,
    );
  }

  async find(
    findOptions: FindAccessRequestOptions,
  ): Promise<IAccessRequestModel> {
    const accessRequest = await this.accessRequestRepository.findOne({
      where: { ...findOptions },
      relations: {
        updatedBy: true,
        requestedBy: true,
      },
    });

    return accessRequest
      ? AccessRequestTransformer.fromEntity(accessRequest)
      : null;
  }

  async update({
    id,
    ...updates
  }: UpdateAccessRequestModel): Promise<IAccessRequestModel> {
    await this.accessRequestRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async create(
    newRequest: CreateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    const accessRequestEntity = await this.accessRequestRepository.save(
      AccessRequestTransformer.toEntity(newRequest),
    );

    return AccessRequestTransformer.fromEntity(accessRequestEntity);
  }

  async delete(id: string): Promise<string> {
    const accessRequest = await this.accessRequestRepository.findOneBy({ id });

    if (accessRequest) {
      await this.accessRequestRepository.remove(accessRequest);
      return id;
    }

    return null;
  }
}
