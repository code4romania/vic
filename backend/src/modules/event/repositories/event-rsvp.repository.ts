import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { VolunteerProfileEntity } from 'src/modules/volunteer/entities/volunteer-profile.entity';
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

  async findMany(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<Pagination<IEventRSVPModel>> {
    let query = this.rsvpRepository
      .createQueryBuilder('rsvp')
      .leftJoinAndMapOne('rsvp.user', 'rsvp.user', 'user')
      .leftJoinAndMapOne(
        'rsvp.event',
        'rsvp.event',
        'event',
        'event.id = :eventId',
        {
          eventId: findOptions.eventId,
        },
      )
      .leftJoinAndMapMany(
        'user.volunteer',
        VolunteerEntity,
        'volunteer',
        'volunteer.organizationId = event.organizationId AND volunteer.user_id = user.id',
      )
      .select()
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

    if (
      findOptions.branchId ||
      findOptions.departmentId ||
      findOptions.roleId
    ) {
      // Need to filter by users who are volunteers in the organization who created the event
      query = query.leftJoinAndMapOne(
        'volunteer.volunteerProfile',
        VolunteerProfileEntity,
        'volunteerProfile',
        'volunteer.volunteerProfileId = volunteerProfile.id',
      );
      if (findOptions.roleId) {
        query.andWhere('volunteerProfile.roleId = :roleId', {
          roleId: findOptions.roleId,
        });
      }
      if (findOptions.departmentId) {
        query.andWhere('volunteerProfile.departmentId = :departmentId', {
          departmentId: findOptions.departmentId,
        });
      }
      if (findOptions.branchId) {
        query.andWhere('volunteerProfile.branchId = :branchId', {
          branchId: findOptions.branchId,
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
