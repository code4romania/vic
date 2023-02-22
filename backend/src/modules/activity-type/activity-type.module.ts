import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTypeEntity } from './entities/activity-type.entity';
import { ActivityTypeRepositoryService } from './repositories/activity-type.repository';
import { ActivityTypeFacade } from './services/activity-type.facade';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityTypeEntity])],
  providers: [
    // Repositories
    ActivityTypeRepositoryService,
    // Facades
    ActivityTypeFacade,
  ],
  exports: [
    // Export only facades!
    ActivityTypeFacade,
  ],
})
export class ActivityTypeModule {}
