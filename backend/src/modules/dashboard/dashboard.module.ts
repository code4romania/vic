import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardVolunteerStatusView } from './entities/dashboard-volunteer-status-view.entity';
import { DashboardVolunteerStatusRepository } from './repositories/dashboard-volunteer-status.repository';
import { DashboardFacade } from './services/dashboard.facade';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardVolunteerStatusView])],
  providers: [
    // Repositories
    DashboardVolunteerStatusRepository,
    // Facade
    DashboardFacade,
  ],
  exports: [DashboardFacade],
})
export class DashboardModule {}
