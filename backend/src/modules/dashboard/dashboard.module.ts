import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardVolunteerStatusView } from './entities/volunteer-status.view';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardVolunteerStatusView])],
  providers: [],
  exports: [],
})
export class DashboardModule {}
