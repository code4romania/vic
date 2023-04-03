import { Injectable } from '@nestjs/common';
import {
  FindDashboardVolunteersGrouped,
  FindDashboardVolunteerStatusChartOptions,
  IDashaboardVolunteersGrouped,
  IDashboardVolunteerStatusTimeseries,
} from '../model/dashboard.model';
import { DashboardRepository } from '../repositories/dashboard-volunteer-status.repository';

@Injectable()
export class DashboardFacade {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  public findDashboardVolunteerStatusTimeseries(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusTimeseries[]> {
    return this.dashboardRepository.findDashboardVolunteerStatusTimeseries(
      findOptions,
    );
  }

  async findVolunteersStatisticsGrouped(
    findOptions: FindDashboardVolunteersGrouped,
  ): Promise<IDashaboardVolunteersGrouped[]> {
    return this.dashboardRepository.findVolunteersStatisticsGrouped(
      findOptions,
    );
  }
}
