import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateEventOptions,
  FindManyEventOptions,
  IEventModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';

export interface IEventRepository {
  create(newEvent: CreateEventOptions): Promise<IEventModel>;
  update(id: string, updates: UpdateEventOptions): Promise<IEventModel>;
  updateStatus(id: string, status: UpdateStatusOptions): Promise<IEventModel>;
  find(id: string): Promise<IEventModel>;
  delete(id: string): Promise<string>;
  getMany(findOptions: FindManyEventOptions): Promise<Pagination<IEventModel>>;
}
