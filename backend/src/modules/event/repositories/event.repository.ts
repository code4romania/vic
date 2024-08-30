import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { ActivityTypeTransformer } from 'src/modules/activity-type/models/activity-type.model';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
import {
  LessThanOrEqual,
  MoreThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { EventState } from '../enums/event-time.enum';
import { IEventRepository } from '../interfaces/event-repository.interface';
import {
  CreateEventOptions,
  EventModelTransformer,
  FindManyEventOptions,
  FindMyEventsOptions,
  FindOneEventOptions,
  FindOngoingAndFinishedEventOptions,
  IEventModel,
  IEventsListItemModel,
  IEventsMobileListItemModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';
import { EventStatus } from '../enums/event-status.enum';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { endOfDay, endOfMonth } from 'date-fns';
import { VolunteerProfileEntity } from 'src/modules/volunteer/entities/volunteer-profile.entity';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

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
    const {
      eventState,
      organizationId,
      orderBy,
      orderDirection,
      search,
      status,
    } = findOptions;

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
        'event.poster',
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

    if (status) {
      query.andWhere('event.status = :status', { status });
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
        eventRSVPs: {
          user: true,
        },
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
    const query = this.createSelectOpenOrganizationGoingEventsBaseSelectQuery();

    // Get all events in progress from the organizations i am part or public events
    query.andWhere(
      '(event.endDate > :currentDate OR event.endDate IS NULL) AND ((event.isPublic = :isPublic AND event.organizationId NOT IN ' +
        query
          .subQuery()
          .select('vol.organizationId')
          .from(VolunteerEntity, 'vol')
          .where('vol.userId = :userId AND vol.status = :blocked ', {
            userId,
            blocked: VolunteerStatus.BLOCKED,
          })
          .getQuery() +
        ') OR (v.userId = :userId AND v.status = :active AND (targets.id = vp.departmentId OR targets.id IS NULL)))',
      {
        isPublic: true,
        currentDate: new Date(),
        userId,
        active: VolunteerStatus.ACTIVE,
      },
    );

    return this.searchOrderAndPaginate(query, filters);
  }

  // Get all ongoing events public or from the organizations the user is part of
  async findMyOrganizationsEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId, ...filters } = findOptions;
    const query = this.createSelectOpenOrganizationGoingEventsBaseSelectQuery();

    query.andWhere(
      '(event.endDate > :currentDate OR event.endDate IS NULL) AND v.userId = :userId AND v.status = :volunteerStatus AND (targets.id = vp.departmentId OR targets.id IS NULL)',
      {
        currentDate: new Date(),
        userId,
        volunteerStatus: VolunteerStatus.ACTIVE,
      },
    );

    return this.searchOrderAndPaginate(query, filters);
  }

  // get all ongoing or upcoming events where the user have confirmed going
  async findGoingEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId, ...filters } = findOptions;
    const query = this.createSelectOpenOrganizationGoingEventsBaseSelectQuery();

    query.andWhere(
      '(event.endDate > :currentDate OR event.endDate IS NULL) AND ((v.status = :active AND v.userId = :userId) OR event.isPublic = :isPublic)',
      {
        currentDate: new Date(),
        active: VolunteerStatus.ACTIVE,
        isPublic: true,
      },
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

  async findOngoingAndFinishedEvents(
    findOptions: FindOngoingAndFinishedEventOptions,
  ): Promise<IEventModel[]> {
    const { organizationId } = findOptions;
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .select()
      .where(
        'event.status = :status AND event.startDate <= :currentDate AND event.organizationId = :organizationId',
        {
          status: EventStatus.PUBLISHED,
          currentDate: new Date(),
          organizationId,
        },
      )
      .getMany();

    return events.map(EventModelTransformer.fromEntity);
  }

  private createSelectOpenOrganizationGoingEventsBaseSelectQuery(): SelectQueryBuilder<EventEntity> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndMapMany('event.targets', 'event.targets', 'targets')
      .leftJoinAndMapOne(
        'event.organization',
        'event.organization',
        'organization',
      )
      .leftJoin(VolunteerEntity, 'v', 'v.organizationId = event.organizationId')
      .leftJoin(VolunteerProfileEntity, 'vp', 'vp.id = v.volunteerProfileId')
      .select([
        'event.id',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.status',
        'event.isPublic',
        'event.createdOn',
        'event.organizationId',
        'event.poster',
        'event.location',
        'targets.id',
        'targets.name',
        'organization.logo',
      ])
      .where('event.status = :status', {
        status: EventStatus.PUBLISHED,
      });
  }

  private searchOrderAndPaginate(
    eventQuery: SelectQueryBuilder<EventEntity>,
    findOptions: Omit<FindMyEventsOptions, 'eventFilter' | 'userId'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { orderBy, orderDirection, search } = findOptions;
    const updatedQuery = eventQuery.orderBy(
      this.buildOrderByQuery(orderBy || 'startDate', 'event'),
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

  public async countUpcomingEvents(userId: string): Promise<number> {
    return this.eventRepository.count({
      where: [
        {
          eventRSVPs: { userId, going: true },
          startDate: LessThanOrEqual(endOfMonth(new Date())),
          endDate: MoreThan(endOfDay(new Date())),
        },
      ],
    });
  }
}
