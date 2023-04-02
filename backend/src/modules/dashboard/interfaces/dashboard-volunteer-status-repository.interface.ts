import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusChart,
} from '../model/dashboard.model';

export interface IDashboardVolunteerStatusRepository {
  findMany(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusChart[]>;
}
