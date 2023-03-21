import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsArchiveEntity } from './entities/actions-archive.entity';
import { ActionsArchiveFacade } from './actions-archive.facade';
import { ActionsArchiveEventListener } from './events/actions-archive-event.listener';

@Module({
  imports: [TypeOrmModule.forFeature([ActionsArchiveEntity])],
  providers: [
    // Listeners
    ActionsArchiveEventListener,

    // Facade
    ActionsArchiveFacade,
  ],
  exports: [ActionsArchiveFacade],
})
export class ActionsArchiveModule {}
