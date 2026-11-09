import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementEntity } from './entities/announcement.entity';
import { AnnouncementResponseEntity } from './entities/announcement-response.entity';
import { AnnouncementResponseRepository } from './repositories/announcement-response.repository';
import { AnnouncementRepositoryService } from './repositories/announcement.repository';
import { AnnouncementFacade } from './services/announcement.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnnouncementEntity, AnnouncementResponseEntity]),
  ],
  providers: [
    // Repositories
    AnnouncementRepositoryService,
    AnnouncementResponseRepository,

    // Facades
    AnnouncementFacade,
  ],
  exports: [AnnouncementFacade],
})
export class AnnouncementModule {}
