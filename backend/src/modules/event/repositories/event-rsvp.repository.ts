import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { IEventRSVPRepository } from '../interfaces/event-rsvp-repository.interface';
import {
  CreateEventRSVPOptions,
  EventRSVPModelTransformer,
  FindEventRSVPOptions,
  FindManyEventRSVPOptions,
  IEventRSVPModel,
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

  async find(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel> {
    const eventEntity = await this.rsvpRepository.findOne({
      where: findOptions,
      relations: {
        event: true,
        user: true,
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
}
