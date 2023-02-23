import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
  IFindAllAnnouncementModel,
  IFindAnnouncementModel,
  IUpdateAnnouncementModel,
} from '../models/announcement.model';

export interface IAnnouncementRepository {
  create(
    newAnnouncement: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel>;
  update(updates: IUpdateAnnouncementModel): Promise<IAnnouncementModel>;
  find(findOptions: IFindAnnouncementModel): Promise<IAnnouncementModel>;
  findAll(
    findOptions: IFindAllAnnouncementModel,
  ): Promise<IAnnouncementModel[]>;
  delete(id: string): Promise<string>;
}
