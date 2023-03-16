import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { ActivityTypeTransformer } from 'src/modules/activity-type/models/activity-type.model';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
import { Repository } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { EventState } from '../enums/event-time.enum';
import { IEventRepository } from '../interfaces/event-repository.interface';
import {
  CreateEventOptions,
  EventModelTransformer,
  FindManyEventOptions,
  FindOneEventOptions,
  IEventModel,
  IEventsListItemModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';

@Injectable()
export class EventRepository
  extends RepositoryWithPagination<EventEntity>
  implements IEventRepository
{
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {
    super(eventRepository);
  }

  async getMany(
    findOptions: FindManyEventOptions,
  ): Promise<Pagination<IEventsListItemModel>> {
    const { eventState, organizationId, orderBy, orderDirection } = findOptions;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .loadRelationCountAndMap(
        'event.going',
        'event.eventRSVPs',
        'eventRSVPs',
        (qb) => qb.where(`"eventRSVPs"."going" = 'true'`),
      )
      .loadRelationCountAndMap(
        'event.notGoing',
        'event.eventRSVPs',
        'eventRSVPs',
        (qb) => qb.where(`"eventRSVPs"."going" = 'false'`),
      )
      .select([
        'event.id',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.status',
        'event.isPublic',
        'event.organizationId',
        'targets.id',
        'targets.name', // TODO: need number of members per target, create a View
      ])
      .where('event.organizationId = :organizationId', { organizationId })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'event'),
        orderDirection || OrderDirection.ASC,
      );

    const currentDate = new Date();
    if (eventState === EventState.OPEN) {
      query.andWhere(
        '(event.endDate > :currentDate OR event.endDate IS NULL)',
        {
          currentDate,
        },
      );
    } else {
      query.andWhere('event.endDate <= :currentDate', {
        currentDate,
      });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      EventModelTransformer.fromEntityToEventItem,
    );
  }

  async create(newEvent: CreateEventOptions): Promise<IEventModel> {
    const eventEntity = await this.eventRepository.save(
      EventModelTransformer.toEntity(newEvent),
    );

    return this.find({ id: eventEntity.id });
  }

  async update(
    id: string,
    { targetsIds, tasksIds, ...updates }: UpdateEventOptions,
  ): Promise<IEventModel> {
    const targets = targetsIds?.map(OrganizationStructureTransformer.toEntity);
    const tasks = tasksIds?.map(ActivityTypeTransformer.toEntity);

    const toUpdate = await this.eventRepository.preload({
      id,
      targets,
      tasks,
      ...updates,
    });

    await this.eventRepository.save(toUpdate);

    return this.find({ id });
  }

  async updateStatus(
    id: string,
    status: UpdateStatusOptions,
  ): Promise<IEventModel> {
    await this.eventRepository.update({ id }, { status });

    return this.find({ id });
  }

  async find(findOptions: FindOneEventOptions): Promise<IEventModel> {
    const eventEntity = await this.eventRepository.findOne({
      where: findOptions,
      relations: {
        organization: true,
        targets: true,
        tasks: true,
      },
    });

    return EventModelTransformer.fromEntity(eventEntity);
  }

  async delete(id: string): Promise<string> {
    const event = await this.eventRepository.findOneBy({ id });

    if (event) {
      await this.eventRepository.remove(event);
      return id;
    }

    return null;
  }
}
