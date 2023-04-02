import { Injectable } from '@nestjs/common';
import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusChart,
} from '../model/dashboard.model';
import { DashboardVolunteerStatusRepository } from '../repositories/dashboard-volunteer-status.repository';

@Injectable()
export class DashboardFacade {
  constructor(
    private readonly dashboardVolunteerStatusRepository: DashboardVolunteerStatusRepository,
  ) {}

  public findDashboardVolunteerStatusTimeseries(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusChart[]> {
    return this.dashboardVolunteerStatusRepository.findMany(findOptions);
  }
}
