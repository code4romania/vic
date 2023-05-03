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

    if (findOptions.author) {
      query.andWhere('author.name = :author', {
        author: findOptions.author,
      });
    }

    if (findOptions.search) {
      query.where(
        `exists (select 1 from jsonb_each_text(actionsArchive.eventData) as kv where kv.value ilike :search) OR exists (select 1 from jsonb_each_text(actionsArchive.changes) as kv where kv.value ilike :search)`,
        { search: `%${findOptions.search}%` },
      );
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
