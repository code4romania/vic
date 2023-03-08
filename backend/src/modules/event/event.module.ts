import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRSVPEntity } from './entities/event-rsvp.entity';
import { EventEntity } from './entities/event.entity';
import { EventRSVPRepository } from './repositories/event-rsvp.repository';
import { EventRepository } from './repositories/event.repository';
import { EventFacade } from './services/event.facade';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventRSVPEntity])],
  providers: [EventRepository, EventRSVPRepository, EventFacade],
  exports: [EventFacade],
})
export class EventModule {}
