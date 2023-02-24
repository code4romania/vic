import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AnnouncementEntity } from '../entities/announcement.entity';
import { IAnnouncementRepository } from '../interfaces/announcement-repository.interface';
import {
  AnnouncementStructureTransformer,
  IAnnouncementModel,
  ICreateAnnouncementModel,
  IFindAllAnnouncementModel,
  IFindAnnouncementModel,
  IUpdateAnnouncementModel,
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

  async find(findOptions: IFindAnnouncementModel): Promise<IAnnouncementModel> {
    const announcement = await this.announcementRepository.findOne({
      where: { ...findOptions },
      relations: {
        targets: true,
      },
    });

    return announcement
      ? AnnouncementStructureTransformer.fromEntity(announcement)
      : null;
  }

  async findMany(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<Pagination<IAnnouncementModel>> {
    const options: {
      filters: FindOptionsWhere<AnnouncementEntity>;
    } & IBasePaginationFilterModel = {
      ...findOptions,
      filters: {
        organizationId: findOptions.organizationId,
      },
    };

    return this.findManyPaginated<IAnnouncementModel>(
      {
        searchableColumns: [],
        defaultSortBy: 'name',
        defaultOrderDirection: OrderDirection.ASC,
        relations: {
          targets: true,
        },
      },
      options,
      AnnouncementStructureTransformer.fromEntity,
    );
  }

  async create(
    newAnnouncement: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    const announcement = await this.announcementRepository.save(
      AnnouncementStructureTransformer.toEntity(newAnnouncement),
    );

    return this.find({ id: announcement.id });
  }

  async update({
    id,
    targetsIds,
    ...updates
  }: IUpdateAnnouncementModel): Promise<IAnnouncementModel> {
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
