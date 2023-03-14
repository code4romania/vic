import {
  CreateEventOptions,
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
}
