import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { ActionsArchiveEntity } from '../entities/actions-archive.entity';
import { IActionArchiveRepository } from '../interfaces/actions-archive-repository.interface';
import {
  ActionsArchiveTransformer,
  FindManyActionsArchiveOptions,
  IActionArchiveModel,
} from '../models/actions-archive.model';

@Injectable()
export class ActionsArchiveRepository
  extends RepositoryWithPagination<ActionsArchiveEntity>
  implements IActionArchiveRepository
{
  constructor(
    @InjectRepository(ActionsArchiveEntity)
    private readonly actionsArchiveRepo: Repository<ActionsArchiveEntity>,
  ) {
    super(actionsArchiveRepo);
  }
  findMany(
    findOptions: FindManyActionsArchiveOptions,
  ): Promise<Pagination<IActionArchiveModel>> {
    let query = this.actionsArchiveRepo
      .createQueryBuilder('actionsArchive')
      .leftJoinAndMapOne(
        'actionsArchive.author',
        'actionsArchive.author',
        'author',
      )
      .select()
      .where('author.organizationId = :organizationId', {
        organizationId: findOptions.organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(
          findOptions.orderBy || 'createdOn',
          'actionsArchive',
        ),
        findOptions.orderDirection || OrderDirection.ASC,
      );

    if (findOptions.authorId) {
      query.andWhere('author.id = :authorId', {
        authorId: findOptions.authorId,
      });
    }

    if (findOptions.actionStartDate) {
      query = this.addRangeConditionToQuery(
        query,
        'actionsArchive.createdOn',
        findOptions.actionStartDate,
        findOptions.actionEndDate,
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      ActionsArchiveTransformer.fromEntity,
    );
  }
}
