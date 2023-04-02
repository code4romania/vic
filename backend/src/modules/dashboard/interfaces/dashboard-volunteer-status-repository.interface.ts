import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusTimeseries,
} from '../model/dashboard.model';

export interface IDashboardVolunteerStatusRepository {
  findMany(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusTimeseries[]>;
}
