import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
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
      relations: {
        targets: true,
      },
    });

    return AnnouncementStructureTransformer.fromEntity(announcement);
  }

  async findMany(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    const {
      orderBy,
      orderDirection,
      organizationId,
      organizationIds,
      search,
      targets,
      status,
    } = findOptions;

    // create query
    const query = this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndMapMany(
        'announcement.targets',
        'announcement.targets',
        'targets',
      )
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

    if (organizationIds) {
      query.andWhere('announcement.organizationId IN (:...organizationIds)', {
        organizationIds,
      });
    }

    if (status) {
      query.andWhere('announcement.status = :status', { status });
    }

    if (targets) {
      query.innerJoin(
        'announcement.targets',
        'target',
        'target.name IN (:...targets)',
        { targets },
      );
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
    { targetsIds, ...updates }: UpdateAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    const targets = targetsIds?.map(OrganizationStructureTransformer.toEntity);

    const toUpdate = await this.announcementRepository.preload({
      id,
      targets,
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
