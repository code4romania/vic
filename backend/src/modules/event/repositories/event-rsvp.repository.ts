import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { eventEndSql } from '../event-end';
import { IEventRSVPRepository } from '../interfaces/event-rsvp-repository.interface';
import {
  CreateEventRSVPOptions,
  EventRSVPModelTransformer,
  FindEventRSVPOptions,
  FindManyEventRegistrationsOptions,
  FindManyEventRSVPOptions,
  IEventRegistrationListItem,
  IEventRSVPModel,
  IEventRSVPTransaction,
  UpdateEventRSVPOptions,
} from '../models/event-rsvp.model';

@Injectable()
export class EventRSVPRepository
  extends RepositoryWithPagination<EventRSVPEntity>
  implements IEventRSVPRepository
{
  constructor(
    @InjectRepository(EventRSVPEntity)
    private readonly rsvpRepository: Repository<EventRSVPEntity>,
  ) {
    super(rsvpRepository);
  }

  async create(rsvp: CreateEventRSVPOptions): Promise<IEventRSVPModel> {
    const rsvpEntity = await this.rsvpRepository.save(
      EventRSVPModelTransformer.toEntity(rsvp),
    );

    return this.find({ id: rsvpEntity.id });
  }

  // B7: registrations of one event change one at a time. The event row is locked (SELECT ... FOR
  // UPDATE) for the whole transaction, so two volunteers (or a volunteer and an admin) cannot both
  // take the last seat: the second one waits, then counts the first one's registration.
  async withEventLock<T>(
    eventId: string,
    work: (tx: IEventRSVPTransaction) => Promise<T>,
  ): Promise<T> {
    return this.rsvpRepository.manager.transaction(async (manager) => {
      const [event] = await manager.query(
        `SELECT capacity FROM event WHERE id = $1 FOR UPDATE`,
        [eventId],
      );
      const tx: IEventRSVPTransaction = {
        capacity: event?.capacity ?? null,
        countApproved: async () => {
          const [row] = await manager.query(
            `SELECT count(*) AS n FROM event_rsvp WHERE event_id = $1 AND going AND status = 'approved'`,
            [eventId],
          );
          return +row.n;
        },
        findStatus: async (userId) =>
          (await manager.findOne(EventRSVPEntity, {
            select: {
              id: true,
              going: true,
              status: true,
              rejectionReason: true,
            },
            where: { eventId, userId },
          })) ?? null,
        create: async (rsvp) =>
          (
            await manager.save(
              EventRSVPEntity,
              EventRSVPModelTransformer.toEntity(rsvp),
            )
          ).id,
        update: async (id, updates) => {
          await manager.update(EventRSVPEntity, { id }, { ...updates });
        },
      };
      return work(tx);
    });
  }

  async find(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel> {
    const eventEntity = await this.rsvpRepository.findOne({
      where: findOptions,
      relations: {
        event: true,
        user: { notificationsSettings: true },
        decidedBy: true,
      },
    });

    return eventEntity
      ? EventRSVPModelTransformer.fromEntity(eventEntity)
      : null;
  }

  async update(
    id: string,
    updates: UpdateEventRSVPOptions,
  ): Promise<IEventRSVPModel> {
    await this.rsvpRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async delete(id: string): Promise<string> {
    const rsvp = await this.rsvpRepository.findOneBy({ id });

    if (rsvp) {
      await this.rsvpRepository.remove(rsvp);
      return id;
    }

    return null;
  }

  async deleteAllRSVPsForUser(userId: string): Promise<void> {
    await this.rsvpRepository.delete({ userId });
  }

  async findMany(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<Pagination<IEventRSVPModel>> {
    let query = this.rsvpRepository
      .createQueryBuilder('rsvp')
      .leftJoinAndMapOne('rsvp.user', 'rsvp.user', 'user')
      .leftJoinAndMapOne('rsvp.event', 'rsvp.event', 'event')
      .leftJoinAndMapMany(
        'user.volunteer',
        'user.volunteer',
        'volunteer',
        'volunteer.organizationId = event.organizationId',
      )
      .select()
      .where('event.id = :eventId', { eventId: findOptions.eventId })
      .orderBy(
        this.buildOrderByQuery(findOptions.orderBy || 'user.name', 'rsvp'),
        findOptions.orderDirection || OrderDirection.ASC,
      );

    if (findOptions.going !== undefined) {
      query.andWhere('rsvp.going = :going', {
        going: findOptions.going,
      });
      // "going" means a registration the NGO has not rejected (#501), in the list and its export
      if (findOptions.going) {
        query.andWhere(
          '(rsvp.status IS NULL OR rsvp.status <> :rejectedRegistration)',
          { rejectedRegistration: 'rejected' },
        );
      }
    }

    if (findOptions.search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['user.name', 'user.email'],
          findOptions.search,
        ),
      );
    }

    if (findOptions.branch || findOptions.department || findOptions.role) {
      // Need to filter by users who are volunteers in the organization who created the event
      query = query
        .leftJoinAndMapOne(
          'volunteer.volunteerProfile',
          'volunteer.volunteerProfile',
          'volunteerProfile',
        )
        .leftJoinAndMapOne(
          'volunteerProfile.branch',
          'volunteerProfile.branch',
          'branch',
        )
        .leftJoinAndMapOne(
          'volunteerProfile.role',
          'volunteerProfile.role',
          'role',
        )
        .leftJoinAndMapOne(
          'volunteerProfile.department',
          'volunteerProfile.department',
          'department',
        );

      if (findOptions.role) {
        query.andWhere('role.name = :role', {
          role: findOptions.role,
        });
      }
      if (findOptions.department) {
        query.andWhere('department.name = :department', {
          department: findOptions.department,
        });
      }
      if (findOptions.branch) {
        query.andWhere('branch.name = :branch', {
          branch: findOptions.branch,
        });
      }
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      EventRSVPModelTransformer.fromEntity,
    );
  }

  // #501: the organization's registrations ("going" answers) with one status, newest first
  async findManyRegistrations({
    organizationId,
    status,
    eventId,
    search,
    limit,
    page,
  }: FindManyEventRegistrationsOptions): Promise<
    Pagination<IEventRegistrationListItem>
  > {
    const params = [
      organizationId,
      status,
      eventId ?? null,
      search?.trim() || null,
    ];
    const where = `FROM event_rsvp r
       JOIN event e ON e.id = r.event_id
       JOIN "user" u ON u.id = r.user_id
       LEFT JOIN volunteer v ON v.user_id = u.id AND v.organization_id = e.organization_id
       LEFT JOIN volunteer_profile vp ON vp.id = v.volunteer_profile_id
       LEFT JOIN "user" a ON a.id = r.decided_by
       WHERE e.organization_id = $1 AND r.going AND r.status = $2
         AND ($3::uuid IS NULL OR e.id = $3)
         -- M10: a pending registration to an event that has ended can no longer be decided
         AND (r.status <> 'pending' OR ${eventEndSql('e.start_date', 'e.end_date')} > now())
         AND ($4::text IS NULL OR u.name ILIKE '%' || $4 || '%' OR u.email ILIKE '%' || $4 || '%' OR e.name ILIKE '%' || $4 || '%')`;
    const [{ total }] = await this.rsvpRepository.query(
      `SELECT count(*) AS total ${where}`,
      params,
    );
    const rows = await this.rsvpRepository.query(
      `SELECT r.id, r.status, r.rejection_reason AS "rejectionReason", r.decided_on AS "decidedOn",
              a.name AS "decidedByName", r.created_on AS "createdOn",
              e.id AS "eventId", e.name AS "eventName", e.start_date AS "eventStartDate",
              u.id AS "userId", u.name AS "userName", COALESCE(vp.email, u.email) AS "userEmail",
              v.id AS "volunteerId", v.status AS "volunteerStatus"
       ${where}
       ORDER BY r.created_on DESC
       LIMIT $5 OFFSET $6`,
      [...params, limit, (page - 1) * limit],
    );
    const totalItems = +total;
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: rows.map((row: Record<string, any>) => ({
        id: row.id,
        status: row.status,
        rejectionReason: row.rejectionReason,
        decidedOn: row.decidedOn,
        decidedByName: row.decidedByName,
        createdOn: row.createdOn,
        event: {
          id: row.eventId,
          name: row.eventName,
          startDate: row.eventStartDate,
        },
        user: { id: row.userId, name: row.userName, email: row.userEmail },
        volunteerId: row.volunteerId,
        volunteerStatus: row.volunteerStatus,
      })),
      meta: {
        itemCount: rows.length,
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}
