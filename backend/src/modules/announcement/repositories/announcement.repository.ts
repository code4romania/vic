import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { AnnouncementEntity } from '../entities/announcement.entity';
import { IAnnouncementRepository } from '../interfaces/announcement-repository.interface';
import {
  AnnouncementStructureTransformer,
  CreateAnnouncementOptions,
  FindAnnouncementOptions,
  FindManyAnnouncementOptions,
  IAnnouncementModel,
  UpdateAnnouncementOptions,
} from '../models/announcement.model';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';

@Injectable()
export class AnnouncementRepositoryService
  extends RepositoryWithPagination<AnnouncementEntity>
  implements IAnnouncementRepository
{
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepository: Repository<AnnouncementEntity>,
  ) {
    super(announcementRepository);
  }

  async find(
    findOptions: FindAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.announcementRepository.findOne({
      where: findOptions,
    });

    return AnnouncementStructureTransformer.fromEntity(announcement);
  }

  async findMany(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    const { orderBy, orderDirection, organizationId, search, type, status } =
      findOptions;

    // create query
    const query = this.announcementRepository
      .createQueryBuilder('announcement')
      .select()
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'announcement'),
        orderDirection || OrderDirection.DESC,
      );

    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(['announcement.name'], search),
      );
    }

    if (organizationId) {
      query.andWhere('announcement.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (status) {
      query.andWhere('announcement.status = :status', { status });
    }

    if (type) {
      query.andWhere('announcement.type = :type', { type });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      AnnouncementStructureTransformer.fromEntity,
    );
  }

  public async findManyByRegularUser(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    const { orderBy, orderDirection, userId, search, status, visibleOn } =
      findOptions;

    // create query
    const query = this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndMapOne(
        'announcement.organization',
        'announcement.organization',
        'organization',
      )
      .select()
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'announcement'),
        orderDirection || OrderDirection.DESC,
      );

    query.andWhere(
      'announcement.organizationId IN ' +
        query
          .subQuery()
          .select('volunteer.organizationId')
          .from(VolunteerEntity, 'volunteer')
          // Only the NGO's active volunteers: not Candidates, not blocked ones, and not inactive
          // ones (made inactive by the NGO, #589, they keep only the NGO profile and documents;
          // or left by themselves). Answering already needs ACTIVE (#504).
          .where('volunteer.userId = :userId AND volunteer.status = :active', {
            userId,
            active: VolunteerStatus.ACTIVE,
          })
          .getQuery(),
    );

    // VIC 2.0 (#503): only inside the display period
    if (visibleOn) {
      query.andWhere(
        'announcement.displayStartDate <= :visibleOn AND (announcement.displayEndDate IS NULL OR announcement.displayEndDate >= :visibleOn)',
        { visibleOn },
      );
    }

    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(['announcement.name'], search),
      );
    }

    if (status) {
      query.andWhere('announcement.status = :status', { status });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      AnnouncementStructureTransformer.fromEntity,
    );
  }

  async create(
    newAnnouncement: CreateAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.announcementRepository.save(
      AnnouncementStructureTransformer.toEntity(newAnnouncement),
    );

    return this.find({ id: announcement.id });
  }

  async update(
    id: string,
    updates: UpdateAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    const toUpdate = await this.announcementRepository.preload({
      id,
      ...updates,
    });

    await this.announcementRepository.save(toUpdate);

    return this.find({ id });
  }

  async delete(id: string): Promise<string> {
    const announcement = await this.announcementRepository.findOneBy({ id });

    if (announcement) {
      await this.announcementRepository.remove(announcement);
      return id;
    }

    return null;
  }
}
