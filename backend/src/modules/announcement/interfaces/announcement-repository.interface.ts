import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { AnnouncementEntity } from '../entities/announcement.entity';
import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
  IFindAllAnnouncementModel,
  IFindAnnouncementModel,
  IUpdateAnnouncementModel,
} from '../models/announcement.model';

export interface IAnnouncementRepository
  extends IRepositoryWithPagination<AnnouncementEntity> {
  create(
    newAnnouncement: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel>;
  update(
    id: string,
    updates: IUpdateAnnouncementModel,
  ): Promise<IAnnouncementModel>;
  find(findOptions: IFindAnnouncementModel): Promise<IAnnouncementModel>;
  findMany(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<Pagination<IAnnouncementModel>>;
  delete(id: string): Promise<string>;
}
