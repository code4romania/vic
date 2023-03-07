import {
  IEventModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';

export interface IEventRepository {
  create(newEvent: unknown): Promise<IEventModel>;
  update(id: string, updates: UpdateEventOptions): Promise<IEventModel>;
  updateStatus(id: string, status: UpdateStatusOptions): Promise<IEventModel>;
  find(findOptions: unknown): Promise<IEventModel>;
  delete(id: string): Promise<string>;
}
