import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementEntity } from './entities/announcement.entity';
import { AnnouncementRepositoryService } from './repositories/announcement.repository';
import { AnnouncementFacade } from './services/announcement.facade';

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncementEntity])],
  providers: [
    // Repositories
    AnnouncementRepositoryService,

    // Facades
    AnnouncementFacade,
  ],
  exports: [AnnouncementFacade],
})
export class AnnouncementModule {}
