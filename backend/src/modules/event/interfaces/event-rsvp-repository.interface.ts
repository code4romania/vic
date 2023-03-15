import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateEventRSVPOptions,
  FindEventRSVPOptions,
  FindManyEventRSVPOptions,
  IEventRSVPModel,
  UpdateEventRSVPOptions,
} from '../models/event-rsvp.model';

export interface IEventRSVPRepository {
  create(rsvp: CreateEventRSVPOptions): Promise<IEventRSVPModel>;
  update(id: string, updates: UpdateEventRSVPOptions): Promise<IEventRSVPModel>;
  find(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel>;
  findMany(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<Pagination<IEventRSVPModel>>;
  delete(id: string): Promise<string>;
}
