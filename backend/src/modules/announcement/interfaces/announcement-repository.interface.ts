import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AnnouncementEntity } from '../entities/announcement.entity';
import {
  IAnnouncementModel,
  CreateAnnouncementOptions,
  FindAnnouncementOptions,
  FindManyAnnouncementOptions,
  UpdateAnnouncementOptions,
} from '../models/announcement.model';

export interface IAnnouncementRepository
  extends IRepositoryWithPagination<AnnouncementEntity> {
  create(newAnnouncement: FindAnnouncementOptions): Promise<IAnnouncementModel>;
  update(
    id: string,
    updates: UpdateAnnouncementOptions,
  ): Promise<IAnnouncementModel>;
  find(findOptions: CreateAnnouncementOptions): Promise<IAnnouncementModel>;
  findMany(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>>;
  findManyByRegularUser(
    findOptions: FindManyAnnouncementOptions,
  ): Promise<Pagination<IAnnouncementModel>>;
  delete(id: string): Promise<string>;
}
