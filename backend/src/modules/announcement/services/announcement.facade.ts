import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
  IFindAllAnnouncementModel,
  IFindAnnouncementModel,
  IUpdateAnnouncementModel,
} from '../models/announcement.model';
import { AnnouncementRepositoryService } from '../repositories/announcement.repository';

@Injectable()
export class AnnouncementFacade {
  constructor(
    private readonly announcementRepository: AnnouncementRepositoryService,
  ) {}

  public async find(
    findOptions: IFindAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.find(findOptions);
  }

  public async findMany(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<Pagination<IAnnouncementModel>> {
    return this.announcementRepository.findMany(findOptions);
  }

  public async create(
    createAnnouncementModel: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.create(createAnnouncementModel);
  }

  public async update(
    id: string,
    updateAnnouncementModel: IUpdateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.update(id, updateAnnouncementModel);
  }

  public async delete(id: string): Promise<string> {
    return this.announcementRepository.delete(id);
  }
}
