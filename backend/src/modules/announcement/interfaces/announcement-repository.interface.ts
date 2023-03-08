import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AnnouncementEntity } from '../entities/announcement.entity';
import {
  IAnnouncementModel,
  CreateAnnouncementModel,
  FindManyAnnouncementModel,
  FindAnnouncementModel,
  UpdateAnnouncementModel,
} from '../models/announcement.model';

export interface IAnnouncementRepository
  extends IRepositoryWithPagination<AnnouncementEntity> {
  create(newAnnouncement: CreateAnnouncementModel): Promise<IAnnouncementModel>;
  update(
    id: string,
    updates: UpdateAnnouncementModel,
  ): Promise<IAnnouncementModel>;
  find(findOptions: FindAnnouncementModel): Promise<IAnnouncementModel>;
  findMany(
    findOptions: FindManyAnnouncementModel,
  ): Promise<Pagination<IAnnouncementModel>>;
  delete(id: string): Promise<string>;
}
