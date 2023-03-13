import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { EventStatus } from '../enums/event-status.enum';
import {
  CreateEventRSVPOptions,
  FindEventRSVPOptions,
  FindManyEventRSVPOptions,
  IEventRSVPModel,
  UpdateEventRSVPOptions,
} from '../models/event-rsvp.model';
import {
  CreateEventOptions,
  IEventModel,
  UpdateEventOptions,
} from '../models/event.model';
import { EventRSVPRepository } from '../repositories/event-rsvp.repository';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class EventFacade {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly rsvpRepository: EventRSVPRepository,
  ) {}

  async create(newEvent: CreateEventOptions): Promise<IEventModel> {
    return this.eventRepository.create(newEvent);
  }

  async find(id: string): Promise<IEventModel> {
    return this.eventRepository.find(id);
  }

  async update(id: string, updates: UpdateEventOptions): Promise<IEventModel> {
    return this.eventRepository.update(id, updates);
  }

  async delete(id: string): Promise<string> {
    return this.eventRepository.delete(id);
  }

  async publish(id: string): Promise<IEventModel> {
    return this.eventRepository.updateStatus(id, EventStatus.PUBLISHED);
  }

  async archive(id: string): Promise<IEventModel> {
    return this.eventRepository.updateStatus(id, EventStatus.ARCHIVED);
  }

  async createRSVP(rsvp: CreateEventRSVPOptions): Promise<IEventRSVPModel> {
    return this.rsvpRepository.create(rsvp);
  }

  async findRSVP(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel> {
    return this.rsvpRepository.find(findOptions);
  }

  async updateRSVP(
    id: string,
    updates: UpdateEventRSVPOptions,
  ): Promise<IEventRSVPModel> {
    return this.rsvpRepository.update(id, updates);
  }

  async deleteRSVP(id: string): Promise<string> {
    return this.rsvpRepository.delete(id);
  }

  async findManyRSVP(
    findOptions: FindManyEventRSVPOptions,
  ): Promise<Pagination<IEventRSVPModel>> {
    return this.rsvpRepository.findMany(findOptions);
  }
}
