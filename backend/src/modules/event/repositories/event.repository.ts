import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { ActivityTypeTransformer } from 'src/modules/activity-type/models/activity-type.model';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { EventState } from '../enums/event-time.enum';
import { IEventRepository } from '../interfaces/event-repository.interface';
import {
  CreateEventOptions,
  EventModelTransformer,
  FindManyEventOptions,
  FindMyEventsOptions,
  FindOneEventOptions,
  IEventModel,
  IEventsListItemModel,
  IEventsMobileListItemModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';
import { EventStatus } from '../enums/event-status.enum';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';

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
    const { eventState, organizationId, orderBy, orderDirection, search } =
      findOptions;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .leftJoinAndMapMany(
        'event.activityLogs',
        'event.activityLogs',
        'activityLog',
      )
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
        'event.createdOn',
        'event.organizationId',
        'event.location',
        'targets.id',
        'targets.name', // TODO: need number of members per target, create a View
        'activityLog.volunteerId',
        'activityLog.id',
        'activityLog.hours',
      ])
      .where('event.organizationId = :organizationId', { organizationId })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'event'),
        orderDirection || OrderDirection.ASC,
      );

    if (eventState) {
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
    }

    if (search) {
      query.andWhere(this.buildBracketSearchQuery(['event.name'], search));
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

  async findOpenEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId, ...filters } = findOptions;
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .select([
        'event.id',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.status',
        'event.isPublic',
        'event.createdOn',
        'event.organizationId',
        'event.location',
        'targets.id',
        'targets.name',
      ])
      .where('event.status = :status', { status: EventStatus.PUBLISHED });

    // Get all events in progress from the organizations i am part of or public events
    query.andWhere(
      '((event.organizationId IN ' +
        query
          .subQuery()
          .select('volunteer.organizationId')
          .from(VolunteerEntity, 'volunteer')
          .where('volunteer.userId = :userId', { userId })
          .getQuery() +
        ') OR event.isPublic = :isPublic) AND (event.startDate <= :currentDate AND (event.endDate > :currentDate OR event.endDate IS NULL))',
      { isPublic: true, currentDate: new Date() },
    );

    return this.searchOrderAndPaginate(query, filters);
  }

  // Get all ongoing events public or from the organizations the user is part of
  async findMyOrganizationsEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId, ...filters } = findOptions;
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .select([
        'event.id',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.status',
        'event.isPublic',
        'event.createdOn',
        'event.organizationId',
        'event.location',
        'targets.id',
        'targets.name',
      ])
      .where('event.status = :status', { status: EventStatus.PUBLISHED });

    // Get all events in progress from the organizations i am part of
    query.andWhere(
      '(event.organizationId IN ' +
        query
          .subQuery()
          .select('volunteer.organizationId')
          .from(VolunteerEntity, 'volunteer')
          .where('volunteer.userId = :userId', { userId })
          .getQuery() +
        ') AND (event.endDate > :currentDate OR event.endDate IS NULL)',
      { currentDate: new Date() },
    );

    return this.searchOrderAndPaginate(query, filters);
  }

  // get all ongoing or upcoming events where the user have confirmed going
  async findGoingEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId, ...filters } = findOptions;
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .select([
        'event.id',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.status',
        'event.isPublic',
        'event.createdOn',
        'event.organizationId',
        'event.location',
        'targets.id',
        'targets.name',
      ])
      .where(
        'event.status = :status AND (event.endDate > :currentDate OR event.endDate IS NULL)',
        { status: EventStatus.PUBLISHED, currentDate: new Date() },
      );

    // Get all events where i have responded with going
    query.andWhere(
      'event.id IN ' +
        query
          .subQuery()
          .select('rsvp.eventId')
          .from(EventRSVPEntity, 'rsvp')
          .where('rsvp.userId = :userId AND rsvp.going = :going ', {
            userId,
            going: true,
          })
          .getQuery(),
    );

    return this.searchOrderAndPaginate(query, filters);
  }

  private searchOrderAndPaginate(
    eventQuery: SelectQueryBuilder<EventEntity>,
    findOptions: Omit<FindMyEventsOptions, 'eventFilter' | 'userId'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { orderBy, orderDirection, search } = findOptions;
    const updatedQuery = eventQuery.orderBy(
      this.buildOrderByQuery(orderBy || 'name', 'event'),
      orderDirection || OrderDirection.ASC,
    );

    if (search) {
      updatedQuery.andWhere(
        this.buildBracketSearchQuery(['event.name'], search),
      );
    }
    return this.paginateQuery(
      updatedQuery,
      findOptions.limit,
      findOptions.page,
      EventModelTransformer.fromEntityToMobileEventItem,
    );
  }
}
