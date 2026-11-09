import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
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
  EventCountersOptions,
  IEventCountersModel,
  FindEventCandidatesOptions,
  IEventCandidateModel,
  IEventRegistrationExportRow,
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

  // #496: active volunteers with a profile in the event's departments, their approved hours in the
  // organization and whether they already said they are going
  async findCandidates({
    eventId,
    organizationId,
    departmentIds,
    search,
    volunteerIds,
  }: FindEventCandidatesOptions): Promise<IEventCandidateModel[]> {
    const rows = await this.eventRepository.query(
      `SELECT v.id AS "volunteerId", u.id AS "userId", u.name, COALESCE(vp.email, u.email) AS email,
              d.name AS department,
              COALESCE((SELECT sum(l.hours) FROM activity_log l
                        WHERE l.volunteer_id = v.id AND l.organization_id = v.organization_id AND l.status = 'approved'), 0) AS "totalHours",
              EXISTS (SELECT 1 FROM event_rsvp r WHERE r.event_id = $2 AND r.user_id = u.id AND r.going AND r.status = 'approved') AS registered
       FROM volunteer v
       JOIN "user" u ON u.id = v.user_id
       JOIN volunteer_profile vp ON vp.id = v.volunteer_profile_id
       LEFT JOIN organization_structure d ON d.id = vp.department_id
       WHERE v.organization_id = $1
         AND v.status = 'active'
         AND ($3::uuid[] IS NULL OR vp.department_id = ANY($3::uuid[]))
         AND ($4::text IS NULL OR u.name ILIKE '%' || $4 || '%' OR u.email ILIKE '%' || $4 || '%')
         AND ($5::uuid[] IS NULL OR v.id = ANY($5::uuid[]))
       ORDER BY u.name
       LIMIT 200`,
      [
        organizationId,
        eventId,
        departmentIds?.length ? departmentIds : null,
        search?.trim() || null,
        volunteerIds ?? null,
      ],
    );
    return rows.map((row: IEventCandidateModel) => ({
      ...row,
      totalHours: +row.totalHours,
    }));
  }

  // #497: the event's registered ("going", approved since #501) people; profile fields when they volunteer in the organization
  async findRegistrationsForExport(
    eventId: string,
  ): Promise<IEventRegistrationExportRow[]> {
    const rows = await this.eventRepository.query(
      `SELECT u.name, COALESCE(vp.email, u.email) AS email, u.phone,
              d.name AS department, b.name AS branch, ro.name AS role,
              COALESCE((SELECT sum(l.hours) FROM activity_log l
                        WHERE l.volunteer_id = v.id AND l.organization_id = e.organization_id AND l.status = 'approved'), 0) AS hours,
              r.created_on AS "registeredOn"
       FROM event_rsvp r
       JOIN event e ON e.id = r.event_id
       JOIN "user" u ON u.id = r.user_id
       LEFT JOIN volunteer v ON v.user_id = u.id AND v.organization_id = e.organization_id
       LEFT JOIN volunteer_profile vp ON vp.id = v.volunteer_profile_id
       LEFT JOIN organization_structure d ON d.id = vp.department_id
       LEFT JOIN organization_structure b ON b.id = vp.branch_id
       LEFT JOIN organization_structure ro ON ro.id = vp.role_id
       WHERE r.event_id = $1 AND r.going AND r.status = 'approved'
       ORDER BY u.name`,
      [eventId],
    );
    return rows.map((row: IEventRegistrationExportRow) => ({
      ...row,
      hours: +row.hours,
    }));
  }

  countGoing(eventId: string): Promise<number> {
    return this.eventRepository
      .query(
        `SELECT count(*) AS n FROM event_rsvp WHERE event_id = $1 AND going AND status = 'approved'`,
        [eventId],
      )
      .then(([row]) => +row.n);
  }

  // #493: one query; the department filter matches the list's (#494)
  async countByState({
    organizationId,
    departmentId,
  }: EventCountersOptions): Promise<IEventCountersModel> {
    const [row] = await this.eventRepository.query(
      `WITH e AS (
         SELECT event.id, event.start_date > now() AS upcoming
         FROM event
         WHERE event.organization_id = $1
           AND event.status = 'published'
           AND (event.end_date > now() OR event.end_date IS NULL)
           AND ($2::uuid IS NULL
             OR EXISTS (SELECT 1 FROM event_targets_organization_structure t WHERE t."eventId" = event.id AND t."organizationStructureId" = $2)
             OR NOT EXISTS (SELECT 1 FROM event_targets_organization_structure t WHERE t."eventId" = event.id))
       )
       SELECT
         (SELECT count(*) FROM e WHERE e.upcoming) AS upcoming,
         (SELECT count(*) FROM e WHERE NOT e.upcoming) AS ongoing,
         (SELECT count(*) FROM event_rsvp r JOIN e ON e.id = r.event_id WHERE r.going AND r.status = 'approved') AS participants`,
      [organizationId, departmentId ?? null],
    );
    return {
      upcoming: +row.upcoming,
      ongoing: +row.ongoing,
      participants: +row.participants,
    };
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
      departmentId,
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
        // #501: only approved registrations count as going
        (qb) =>
          qb.where(
            `"eventRSVPs"."going" = 'true' AND "eventRSVPs"."status" = 'approved'`,
          ),
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
        'event.capacity',
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
      // an event with no end date has not finished
      const notEnded =
        '(event.endDate > :currentDate OR event.endDate IS NULL)';
      if (eventState === EventState.OPEN) {
        query.andWhere(notEnded, { currentDate });
      } else if (eventState === EventState.UPCOMING) {
        query.andWhere('event.startDate > :currentDate', { currentDate });
      } else if (eventState === EventState.ONGOING) {
        query.andWhere(`event.startDate <= :currentDate AND ${notEnded}`, {
          currentDate,
        });
      } else {
        query.andWhere('event.endDate <= :currentDate', {
          currentDate,
        });
      }
    }

    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    // #494: the events this department's volunteers can see: the ones that target it, and the ones
    // with no target (open to every department). A subquery, so the targets stay complete.
    if (departmentId) {
      query.andWhere(
        `(EXISTS (SELECT 1 FROM event_targets_organization_structure t WHERE t."eventId" = event.id AND t."organizationStructureId" = :departmentId)
          OR NOT EXISTS (SELECT 1 FROM event_targets_organization_structure t WHERE t."eventId" = event.id))`,
        { departmentId },
      );
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
    { targetsIds, ...updates }: UpdateEventOptions,
  ): Promise<IEventModel> {
    const targets = targetsIds?.map(OrganizationStructureTransformer.toEntity);

    const toUpdate = await this.eventRepository.preload({
      id,
      targets,
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
    const { userId } = findOptions;
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

    return this.searchOrderAndPaginate(query, findOptions);
  }

  // Get all ongoing events public or from the organizations the user is part of
  async findMyOrganizationsEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId } = findOptions;
    const query = this.createSelectOpenOrganizationGoingEventsBaseSelectQuery();

    query.andWhere(
      '(event.endDate > :currentDate OR event.endDate IS NULL) AND v.userId = :userId AND v.status = :volunteerStatus AND (targets.id = vp.departmentId OR targets.id IS NULL)',
      {
        currentDate: new Date(),
        userId,
        volunteerStatus: VolunteerStatus.ACTIVE,
      },
    );

    return this.searchOrderAndPaginate(query, findOptions);
  }

  // get all ongoing or upcoming events where the user have confirmed going
  async findGoingEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const { userId } = findOptions;
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

    return this.searchOrderAndPaginate(query, findOptions);
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
        'event.capacity',
        'event.location',
        'targets.id',
        'targets.name',
        'organization.id',
        'organization.name',
        'organization.logo',
      ])
      .where('event.status = :status', {
        status: EventStatus.PUBLISHED,
      });
  }

  private async searchOrderAndPaginate(
    eventQuery: SelectQueryBuilder<EventEntity>,
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>> {
    const {
      orderBy,
      orderDirection,
      search,
      userId,
      organizationId,
      startFrom,
      startTo,
    } = findOptions;
    const updatedQuery = eventQuery.orderBy(
      this.buildOrderByQuery(orderBy || 'startDate', 'event'),
      orderDirection || OrderDirection.ASC,
    );

    if (search) {
      updatedQuery.andWhere(
        this.buildBracketSearchQuery(['event.name'], search),
      );
    }
    if (organizationId) {
      updatedQuery.andWhere('event.organizationId = :filterOrganizationId', {
        filterOrganizationId: organizationId,
      });
    }
    if (startFrom) {
      updatedQuery.andWhere('event.startDate >= :startFrom', { startFrom });
    }
    if (startTo) {
      updatedQuery.andWhere('event.startDate <= :startTo', { startTo });
    }

    const page = await this.paginateQuery(
      updatedQuery,
      findOptions.limit,
      findOptions.page,
      EventModelTransformer.fromEntityToMobileEventItem,
    );

    // whether the volunteer said they are going, for the "Înscris" badge
    const ids = page.items.map((event) => event.id);
    const going = ids.length
      ? await this.eventRepository.manager
          .createQueryBuilder(EventRSVPEntity, 'rsvp')
          .select('rsvp.eventId', 'eventId')
          .where('rsvp.userId = :userId AND rsvp.going = true', { userId })
          .andWhere('rsvp.eventId IN (:...ids)', { ids })
          .getRawMany<{ eventId: string }>()
      : [];
    const goingIds = new Set(going.map((row) => row.eventId));

    return {
      ...page,
      items: page.items.map((event) => ({
        ...event,
        isGoing: goingIds.has(event.id),
      })),
    };
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
