import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import { Repository } from 'typeorm';
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
export class AnnouncementRepositoryService implements IAnnouncementRepository {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepository: Repository<AnnouncementEntity>,
  ) {}

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

  async findAll(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<IAnnouncementModel[]> {
    const announcements = await this.announcementRepository.find({
      where: { ...findOptions },
      relations: {
        targets: true,
      },
    });

    return announcements.map(AnnouncementStructureTransformer.fromEntity);
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
    const announcement = await this.find({ id });

    await this.announcementRepository
      .createQueryBuilder()
      .relation(OrganizationStructureEntity, 'targets')
      .of(announcement)
      .addAndRemove(targetsIds, announcement.targets);
    await this.announcementRepository.update({ id }, { ...updates });

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
