import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateAnnouncementOptions,
  FindAnnouncementOptions,
  FindManyAnnouncementOptions,
  IAnnouncementModel,
  UpdateAnnouncementOptions,
} from '../models/announcement.model';
import { AnnouncementRepositoryService } from '../repositories/announcement.repository';

@Injectable()
export class AnnouncementFacade {
  constructor(
    private readonly announcementRepository: AnnouncementRepositoryService,
  ) {}

  public async find(
    findOptions: FindAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.find(findOptions);
  }

  public async findMany(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    return this.announcementRepository.findMany(findOptions);
  }

  public async findManyByRegularUser(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>> {
    return this.announcementRepository.findManyByRegularUser(findOptions);
  }

  public async create(
    newAnouncement: CreateAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.create(newAnouncement);
  }

  public async update(
    id: string,
    updatedAnouncement: UpdateAnnouncementOptions,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.update(id, updatedAnouncement);
  }

  public async delete(id: string): Promise<string> {
    return this.announcementRepository.delete(id);
  }
}
