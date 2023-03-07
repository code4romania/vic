import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
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
    const {
      orderBy,
      orderDirection,
      organizationId,
      status,
      locationId,
      search,
    } = findOptions;

    const query = this.accessRequestRepository
      .createQueryBuilder('ac')
      .leftJoinAndMapOne('ac.updatedBy', 'ac.updatedBy', 'updatedBy')
      .leftJoinAndMapOne('ac.requestedBy', 'ac.requestedBy', 'requestedBy')
      .leftJoinAndMapOne(
        'requestedBy.location',
        'requestedBy.location',
        'location',
      )
      .leftJoinAndMapOne('location.county', 'location.county', 'county')
      .select()
      .where('ac.organizationId = :organizationId AND ac.status = :status', {
        organizationId,
        status,
      })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'ac'),
        orderDirection || OrderDirection.ASC,
      );

    // search filter
    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['requestedBy.name', 'requestedBy.email', 'requestedBy.phone'],
          search,
        ),
      );
    }

    // location filter
    if (locationId) {
      query.andWhere('location.id = :locationId', { locationId });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
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
        requestedBy: {
          location: {
            county: true,
          },
        },
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

    return this.find({ id: accessRequestEntity.id });
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
