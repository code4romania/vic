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
import { AnnouncementResponseRepository } from '../repositories/announcement-response.repository';
import {
  CreateAnnouncementResponseOptions,
  FindManyAnnouncementResponsesOptions,
  IAnnouncementResponseModel,
} from '../models/announcement-response.model';

@Injectable()
export class AnnouncementFacade {
  constructor(
    private readonly announcementRepository: AnnouncementRepositoryService,
    private readonly responseRepository: AnnouncementResponseRepository,
  ) {}

  // #504: volunteers' answers
  public async createResponse(
    options: CreateAnnouncementResponseOptions,
  ): Promise<string> {
    return this.responseRepository.create(options);
  }

  public async hasResponded(
    announcementId: string,
    userId: string,
  ): Promise<boolean> {
    return this.responseRepository.exists(announcementId, userId);
  }

  public async findResponsesForUser(
    userId: string,
    announcementIds: string[],
  ): Promise<Record<string, { comment: string; createdOn: Date }>> {
    return this.responseRepository.findForUser(userId, announcementIds);
  }

  public async findManyResponses(
    options: FindManyAnnouncementResponsesOptions,
  ): Promise<Pagination<IAnnouncementResponseModel>> {
    return this.responseRepository.findMany(options);
  }

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
