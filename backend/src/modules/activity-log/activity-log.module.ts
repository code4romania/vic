import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { ActivityLogRepositoryService } from './repositories/activity-log.repository';
import { ActivityLogFacade } from './services/activity-log.facade';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogEntity])],
  providers: [
    // Repositories
    ActivityLogRepositoryService,
    // Facades
    ActivityLogFacade,
  ],
  exports: [
    // Export only facades!
    ActivityLogFacade,
  ],
})
export class ActivityLogModule {}
