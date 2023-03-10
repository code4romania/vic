import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityTypeTransformer } from 'src/modules/activity-type/models/activity-type.model';
import { OrganizationStructureTransformer } from 'src/modules/organization/models/organization-structure.model';
import { Repository } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { IEventRepository } from '../interfaces/event-repository.interface';
import {
  CreateEventOptions,
  EventModelTransformer,
  IEventModel,
  UpdateEventOptions,
  UpdateStatusOptions,
} from '../models/event.model';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async create(newEvent: CreateEventOptions): Promise<IEventModel> {
    const eventEntity = await this.eventRepository.save(
      EventModelTransformer.toEntity(newEvent),
    );

    return this.find(eventEntity.id);
  }

  async update(
    id: string,
    { targetsIds, tasksIds, ...updates }: UpdateEventOptions,
  ): Promise<IEventModel> {
    const targets = targetsIds?.map(OrganizationStructureTransformer.toEntity);
    const tasks = tasksIds?.map(ActivityTypeTransformer.toEntity);

    const toUpdate = await this.eventRepository.preload({
      id,
      targets,
      tasks,
      ...updates,
    });

    await this.eventRepository.save(toUpdate);

    return this.find(id);
  }

  async updateStatus(
    id: string,
    status: UpdateStatusOptions,
  ): Promise<IEventModel> {
    await this.eventRepository.update({ id }, { status });

    return this.find(id);
  }

  async find(id: string): Promise<IEventModel> {
    const eventEntity = await this.eventRepository.findOne({
      where: { id },
      relations: {
        organization: true,
        targets: true,
        tasks: true,
      },
    });

    return EventModelTransformer.fromEntity(eventEntity);
  }

  async delete(id: string): Promise<string> {
    const event = await this.eventRepository.findOneBy({ id });

    if (event) {
      await this.eventRepository.remove(event);
      return id;
    }

    return null;
  }
}
