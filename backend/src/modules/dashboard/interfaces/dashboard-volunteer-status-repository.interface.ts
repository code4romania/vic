import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusTimeseries,
} from '../model/dashboard.model';

export interface IDashboardRepository {
  findDashboardVolunteerStatusTimeseries(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusTimeseries[]>;
}
