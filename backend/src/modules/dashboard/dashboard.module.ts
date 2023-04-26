import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerEntity } from '../volunteer/entities/volunteer.entity';
import { DashboardVolunteerStatusView } from './entities/dashboard-volunteer-status-view.entity';
import { DashboardRepository } from './repositories/dashboard-volunteer-status.repository';
import { DashboardFacade } from './services/dashboard.facade';
import { ActivityLogEntity } from '../activity-log/entities/activity-log.entity';
import { AccessRequestEntity } from '../access-request/entities/access-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardVolunteerStatusView,
      VolunteerEntity,
      ActivityLogEntity,
      AccessRequestEntity,
    ]),
  ],
  providers: [
    // Repositories
    DashboardRepository,
    // Facade
    DashboardFacade,
  ],
  exports: [DashboardFacade],
})
export class DashboardModule {}
