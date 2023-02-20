import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTypeEntity } from './entities/activity-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityTypeEntity])],
  providers: [
    // Repositories
    // Facades
  ],
  exports: [
    // Export only facades!
  ],
})
export class ActivityTypeModule {}
