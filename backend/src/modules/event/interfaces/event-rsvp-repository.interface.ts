import {
  CreateEventRSVPOptions,
  FindAllEventRSVPOptions,
  FindEventRSVPOptions,
  IEventRSVPModel,
  UpdateEventRSVPOptions,
} from '../models/event-rsvp.model';

export interface IEventRSVPRepository {
  create(rsvp: CreateEventRSVPOptions): Promise<IEventRSVPModel>;
  update(id: string, updates: UpdateEventRSVPOptions): Promise<IEventRSVPModel>;
  find(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel>;
  delete(id: string): Promise<string>;
  findAll(findOptions: FindAllEventRSVPOptions): Promise<IEventRSVPModel[]>;
}
