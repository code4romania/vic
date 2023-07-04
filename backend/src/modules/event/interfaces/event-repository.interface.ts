import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateEventOptions,
  FindManyEventOptions,
  FindMyEventsOptions,
  FindOneEventOptions,
  FindOngoingAndFinishedEventOptions,
  IEventModel,
  IEventsListItemModel,
  IEventsMobileListItemModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';

export interface IEventRepository {
  create(newEvent: CreateEventOptions): Promise<IEventModel>;
  update(id: string, updates: UpdateEventOptions): Promise<IEventModel>;
  updateStatus(id: string, status: UpdateStatusOptions): Promise<IEventModel>;
  find(findOptions: FindOneEventOptions): Promise<IEventModel>;
  delete(id: string): Promise<string>;
  getMany(
    findOptions: FindManyEventOptions,
  ): Promise<Pagination<IEventsListItemModel>>;
  findOpenEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>>;
  findMyOrganizationsEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>>;
  findGoingEvents(
    findOptions: Omit<FindMyEventsOptions, 'eventFilter'>,
  ): Promise<Pagination<IEventsMobileListItemModel>>;
  findOngoingAndFinishedEvents(
    findOptions: FindOngoingAndFinishedEventOptions,
  ): Promise<IEventModel[]>;
  countUpcomingEvents(userId: string): Promise<number>;
}
