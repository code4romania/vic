import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { AccessCodeEntity } from '../entities/access-code.entity';
import { IAccessCodeRepository } from '../interfaces/access-code-repository.interface';
import {
  AccessCodeTransformer,
  IAccessCodeModel,
  ICreateAccessCodeModel,
  IFindAccessCodeModel,
  IFindAllAccessCodeModel,
  IUpdateAccessCodeModel,
} from '../models/access-code.model';

@Injectable()
export class AccessCodeRepositoryService
  extends RepositoryWithPagination<AccessCodeEntity>
  implements IAccessCodeRepository
{
  constructor(
    @InjectRepository(AccessCodeEntity)
    private readonly accessCodeRepository: Repository<AccessCodeEntity>,
  ) {
    super(accessCodeRepository);
  }

  async create(
    newAccessCode: ICreateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    const accessCode = await this.accessCodeRepository.save(
      AccessCodeTransformer.toEntity(newAccessCode),
    );

    return this.find({ id: accessCode.id });
  }

  async update({
    id,
    ...updates
  }: IUpdateAccessCodeModel): Promise<IAccessCodeModel> {
    await this.accessCodeRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async findMany(
    findOptions: IFindAllAccessCodeModel,
  ): Promise<Pagination<IAccessCodeModel>> {
    const { orderBy, orderDirection, organizationId } = findOptions;

    // create query
    const query = this.accessCodeRepository
      .createQueryBuilder('code')
      .leftJoinAndMapOne('code.createdBy', 'code.createdBy', 'createdBy')
      .select()
      .where('code.organizationId = :organizationId', { organizationId })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'code'),
        orderDirection || OrderDirection.ASC,
      );

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      AccessCodeTransformer.fromEntity,
    );
  }

  async find(findOptions: IFindAccessCodeModel): Promise<IAccessCodeModel> {
    const accessCodeEntity = await this.accessCodeRepository.findOne({
      where: { ...findOptions },
      relations: {
        createdBy: true,
      },
    });

    return accessCodeEntity
      ? AccessCodeTransformer.fromEntity(accessCodeEntity)
      : null;
  }

  async delete(id: string): Promise<string> {
    const accessCodeEntity = await this.accessCodeRepository.findOneBy({ id });

    if (accessCodeEntity) {
      await this.accessCodeRepository.remove(accessCodeEntity);
      return id;
    }

    return null;
  }
}
