import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsArchiveEntity } from './entities/actions-archive.entity';
import { ActionsArchiveFacade } from './actions-archive.facade';
import { ActionsArchiveEventListener } from './events/actions-archive-event.listener';
import { ActionsArchiveRepository } from './repositories/actions-archive.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ActionsArchiveEntity])],
  providers: [
    // Repositories
    ActionsArchiveRepository,

    // Listeners
    ActionsArchiveEventListener,

    // Facade
    ActionsArchiveFacade,
  ],
  exports: [ActionsArchiveFacade],
})
export class ActionsArchiveModule {}
