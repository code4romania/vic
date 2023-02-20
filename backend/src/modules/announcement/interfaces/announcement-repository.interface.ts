import {
  IAnnouncementModel,
  ICreateAnnouncementModel,
  IFindAnnouncementModel,
  IUpdateAnnouncementModel,
} from '../models/announcement.model';

export interface IAnnouncementRepository {
  create(
    newAnnouncement: ICreateAnnouncementModel,
  ): Promise<IAnnouncementModel>;
  update(updates: IUpdateAnnouncementModel): Promise<IAnnouncementModel>;
  find(findOptions: IFindAnnouncementModel): Promise<IAnnouncementModel>;
  delete(id: string): Promise<string>;
}
