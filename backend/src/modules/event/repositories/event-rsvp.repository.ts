import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRSVPEntity } from '../entities/event-rsvp.entity';
import { IEventRSVPRepository } from '../interfaces/event-rsvp-repository.interface';
import {
  CreateEventRSVPOptions,
  EventRSVPModelTransformer,
  FindAllEventRSVPOptions,
  FindEventRSVPOptions,
  IEventRSVPModel,
  UpdateEventRSVPOptions,
} from '../models/event-rsvp.model';

@Injectable()
export class EventRSVPRepository implements IEventRSVPRepository {
  constructor(
    @InjectRepository(EventRSVPEntity)
    private readonly rsvpRepository: Repository<EventRSVPEntity>,
  ) {}

  async create(rsvp: CreateEventRSVPOptions): Promise<IEventRSVPModel> {
    const rsvpEntity = await this.rsvpRepository.save(
      EventRSVPModelTransformer.toEntity(rsvp),
    );

    return this.find({ id: rsvpEntity.id });
  }

  async find(findOptions: FindEventRSVPOptions): Promise<IEventRSVPModel> {
    const eventEntity = await this.rsvpRepository.findOne({
      where: findOptions,
      relations: {
        event: true,
        user: true,
      },
    });

    return eventEntity
      ? EventRSVPModelTransformer.fromEntity(eventEntity)
      : null;
  }

  async findAll(
    findOptions: FindAllEventRSVPOptions,
  ): Promise<IEventRSVPModel[]> {
    const eventRSVPs = await this.rsvpRepository.find({ where: findOptions });

    return eventRSVPs.map(EventRSVPModelTransformer.fromEntity);
  }

  async update(
    id: string,
    updates: UpdateEventRSVPOptions,
  ): Promise<IEventRSVPModel> {
    await this.rsvpRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async delete(id: string): Promise<string> {
    const rsvp = await this.rsvpRepository.findOneBy({ id });

    if (rsvp) {
      await this.rsvpRepository.remove(rsvp);
      return id;
    }

    return null;
  }
}
