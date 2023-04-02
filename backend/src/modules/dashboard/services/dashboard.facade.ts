import { Injectable } from '@nestjs/common';
import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusTimeseries,
} from '../model/dashboard.model';
import { DashboardVolunteerStatusRepository } from '../repositories/dashboard-volunteer-status.repository';

@Injectable()
export class DashboardFacade {
  constructor(
    private readonly dashboardVolunteerStatusRepository: DashboardVolunteerStatusRepository,
  ) {}

  public findDashboardVolunteerStatusTimeseries(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusTimeseries[]> {
    return this.dashboardVolunteerStatusRepository.findMany(findOptions);
  }
}
