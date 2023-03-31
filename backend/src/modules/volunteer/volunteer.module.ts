import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerHistoryEntity } from './entities/history/volunteer-history.entity';
import { VolunteerProfileEntity } from './entities/volunteer-profile.entity';
import { VolunteerEntity } from './entities/volunteer.entity';
import { VolunteerProfileRepositoryService } from './repositories/volunteer-profile.repository';
import { VolunteerRepositoryService } from './repositories/volunteer.repository';
import { VolunteerFacade } from './services/volunteer.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VolunteerEntity,
      VolunteerProfileEntity,
      // History
      VolunteerHistoryEntity,
    ]),
  ],
  providers: [
    VolunteerRepositoryService,
    VolunteerProfileRepositoryService,
    VolunteerFacade,
  ],
  exports: [VolunteerFacade],
})
export class VolunteerModule {}
