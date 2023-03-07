import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventRepository } from './repositories/event.repository';
import { EventFacade } from './services/event.facade';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [EventRepository, EventFacade],
  exports: [EventFacade],
})
export class EventModule {}
