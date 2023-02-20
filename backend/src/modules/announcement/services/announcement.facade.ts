import { Injectable } from '@nestjs/common';
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

  public async findAll(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<IAnnouncementModel[]> {
    return this.announcementRepository.findAll(findOptions);
  }

  public async create(
    createAnnouncementModel: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.create(createAnnouncementModel);
  }

  public async update(
    updateAnnouncementModel: IUpdateAnnouncementModel,
  ): Promise<IAnnouncementModel> {
    return this.announcementRepository.update(updateAnnouncementModel);
  }

  public async delete(id: string): Promise<string> {
    return this.announcementRepository.delete(id);
  }
}
