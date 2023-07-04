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
import { TrackedEventName } from '../enums/action-resource-types.enum';
import { endOfMonth, startOfMonth } from 'date-fns';

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
      query.andWhere(
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

  async countActivityLogBetweenDates(volunteerIds: string[]): Promise<number> {
    const query = this.actionsArchiveRepo
      .createQueryBuilder('archive')
      .where(
        'archive.eventName = :eventName AND archive.createdOn >= :startDate AND archive.createdOn <= :endDate',
        {
          eventName: TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS,
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
        },
      )
      .andWhere(`archive.event_data->>'volunteerId' IN (:...volunteerIds)`, {
        volunteerIds,
      });

    return query.getCount();
  }

  async countDocumentStatusUpdatesBetweenDates(
    volunteerIds: string[],
  ): Promise<number> {
    const query = this.actionsArchiveRepo
      .createQueryBuilder('archive')
      .where(
        'archive.eventName in (:...eventNames) AND archive.createdOn >= :startDate AND archive.createdOn <= :endDate',
        {
          eventNames: [
            TrackedEventName.CREATE_CONTRACT,
            TrackedEventName.APPROVE_CONTRACT,
            TrackedEventName.REJECT_CONTRACT,
          ],
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
        },
      )
      .andWhere(`archive.event_data->>'volunteerId' IN (:...volunteerIds)`, {
        volunteerIds,
      });

    return query.getCount();
  }

  async countAccessRequestStatusUpdatesBetweenDates(
    volunteerIds: string[],
  ): Promise<number> {
    const query = this.actionsArchiveRepo
      .createQueryBuilder('archive')
      .where(
        'archive.eventName in (:...eventNames) AND archive.createdOn >= :startDate AND archive.createdOn <= :endDate',
        {
          eventNames: [
            TrackedEventName.APPROVE_ACCESS_REQUEST,
            TrackedEventName.REJECT_ACCESS_REQUEST,
          ],
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
        },
      )
      .andWhere(`archive.event_data->>'volunteerId' IN (:...volunteerIds)`, {
        volunteerIds,
      });

    return query.getCount();
  }
}
