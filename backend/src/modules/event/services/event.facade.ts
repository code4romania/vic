import { Injectable } from '@nestjs/common';
import { EventStatus } from '../enums/event-status.enum';
import {
  CreateEventOptions,
  IEventModel,
  UpdateEventOptions,
} from '../models/event.model';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class EventFacade {
  constructor(private readonly eventRepository: EventRepository) {}

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
}
