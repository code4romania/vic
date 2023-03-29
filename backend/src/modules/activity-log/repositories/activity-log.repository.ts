import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ActivityLogResolutionStatus } from '../enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../enums/activity-log-status.enum';
import { IActivityLogRepository } from '../interfaces/activity-log-repository.interface';
import {
  ActivityLogModelTransformer,
  CreateActivityLogByAdminOptions,
  FindManyActivityLogsOptions,
  IActivityLogCountHoursByStatus,
  IActivityLogListItemModel,
  IActivityLogModel,
  UpdateActivityLogOptions,
} from '../models/activity-log.model';

@Injectable()
export class ActivityLogRepositoryService
  extends RepositoryWithPagination<ActivityLogEntity>
  implements IActivityLogRepository
{
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepo: Repository<ActivityLogEntity>,
  ) {
    super(activityLogRepo);
  }

  findMany(
    findOptions: FindManyActivityLogsOptions,
  ): Promise<Pagination<IActivityLogListItemModel>> {
    let query = this.activityLogRepo // TODO: strong type queries to use only the resulting select
      .createQueryBuilder('activityLog')
      .leftJoinAndMapOne('activityLog.event', 'activityLog.event', 'event')
      .leftJoinAndMapOne(
        'activityLog.volunteer',
        'activityLog.volunteer',
        'volunteer',
      )
      .leftJoinAndMapOne('volunteer.user', 'volunteer.user', 'user')
      .leftJoinAndMapOne(
        'activityLog.activityType',
        'activityLog.activityType',
        'activityType',
      )
      .leftJoinAndMapOne(
        'activityLog.rejectedBy',
        'activityLog.rejectedBy',
        'rejectedBy',
      )
      .leftJoinAndMapOne(
        'activityLog.approvedBy',
        'activityLog.approvedBy',
        'approvedBy',
      )
      .leftJoinAndMapOne(
        'activityLog.createdByAdmin',
        'activityLog.createdByAdmin',
        'createdByAdmin',
      )
      .select([
        'activityLog.id',
        'activityLog.date',
        'activityLog.hours',
        'activityLog.status',
        'activityLog.createdOn',
        'volunteer.id',
        'user.name',
        'event.id',
        'event.name',
        'activityType.id',
        'activityType.name',
        'activityType.icon',
      ])
      .where('activityLog.organizationId = :organizationId', {
        organizationId: findOptions.organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(
          findOptions.orderBy || 'createdOn',
          'activityLog',
        ),
        findOptions.orderDirection || OrderDirection.ASC,
      );

    if (findOptions.search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['activityType.name', 'user.name', 'event.name'],
          findOptions.search,
        ),
      );
    }

    if (findOptions.eventId) {
      query.andWhere('event.id = :eventId', { eventId: findOptions.eventId });
    }

    if (findOptions.volunteerId) {
      query.andWhere('volunteer.id = :volunteerId', {
        volunteerId: findOptions.volunteerId,
      });
    }

    if (findOptions.resolutionStatus === ActivityLogResolutionStatus.NEW) {
      query.andWhere('activityLog.status = :status', {
        status: ActivityLogStatus.PENDING,
      });
    } else {
      // Only APPROVED or REJECTED can be filtered by STATUS
      if (findOptions.status) {
        query.andWhere('activityLog.status = :status', {
          status: findOptions.status,
        });
      } else {
        query.andWhere(
          '(activityLog.status = :statusApproved OR activityLog.status = :statusRejected)',
          {
            statusApproved: ActivityLogStatus.APPROVED,
            statusRejected: ActivityLogStatus.REJECTED,
          },
        );
      }
    }

    if (findOptions.approvedOrRejectedById) {
      query.andWhere(
        '(activityLog.approvedById = :approvedOrRejectedById OR activityLog.rejectedById = :approvedOrRejectedById)',
        {
          approvedOrRejectedById: findOptions.approvedOrRejectedById,
        },
      );
    }

    if (findOptions.executionDateStart) {
      query = this.addRangeConditionToQuery(
        query,
        'activityLog.date',
        findOptions.executionDateStart,
        findOptions.executionDateEnd,
      );
    }

    if (findOptions.registrationDateStart) {
      query = this.addRangeConditionToQuery(
        query,
        'activityLog.createdOn',
        findOptions.registrationDateStart,
        findOptions.registrationDateEnd,
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      ActivityLogModelTransformer.fromEntityToListItem,
    );
  }

  async create(
    newLog: CreateActivityLogByAdminOptions,
  ): Promise<IActivityLogModel> {
    const entity = await this.activityLogRepo.save(
      ActivityLogModelTransformer.toEntity(newLog),
    );

    return this.find(entity.id);
  }

  async find(id: string): Promise<IActivityLogModel> {
    const log = await this.activityLogRepo.findOne({
      where: { id },
      relations: {
        event: {
          organization: true,
        },
        volunteer: {
          user: true,
        },
        createdByAdmin: true,
        approvedBy: true,
        rejectedBy: true,
        activityType: true,
      },
    });

    return log ? ActivityLogModelTransformer.fromEntity(log) : null;
  }

  async update(
    id: string,
    updates: UpdateActivityLogOptions,
  ): Promise<IActivityLogModel> {
    await this.activityLogRepo.update({ id }, { ...updates });

    return this.find(id);
  }

  async countHourByStatus(
    organizationId: string,
  ): Promise<IActivityLogCountHoursByStatus> {
    const counters: {
      status: ActivityLogStatus;
      count: number;
      hours: number;
    }[] = await this.activityLogRepo
      .createQueryBuilder('activityLog')
      .select('activityLog.status', 'status')
      .addSelect('activityLog.hours', 'hours')
      .addSelect('COUNT(activityLog.id)', 'count')
      .groupBy('activityLog.status')
      .addGroupBy('activityLog.hours')
      .where('activityLog.organizationId = :organizationId', {
        organizationId,
      })
      .getRawMany();

    return counters.reduce(
      (acc, curr) => {
        acc[curr.status] += curr.hours;
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    );
  }
}
