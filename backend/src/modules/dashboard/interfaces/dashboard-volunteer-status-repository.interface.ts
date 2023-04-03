import {
  FindDashboardVolunteerStatusChartOptions,
  FindDashboardVolunteersGrouped,
  IDashaboardVolunteersGrouped,
  IDashboardVolunteerStatusTimeseries,
  IDashboardVolunteersHours,
  IDashboardVolunteersStatus,
} from '../model/dashboard.model';

export interface IDashboardRepository {
  findDashboardVolunteerStatusTimeseries(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusTimeseries[]>;
  findVolunteersStatisticsGrouped(
    findOptions: FindDashboardVolunteersGrouped,
  ): Promise<IDashaboardVolunteersGrouped[]>;
  countVolunteersHours(): Promise<IDashboardVolunteersHours>;
  countVolunteersStatus(): Promise<IDashboardVolunteersStatus>;
}
