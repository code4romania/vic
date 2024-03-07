import {
  FindDashboardVolunteerStatusChartOptions,
  FindDashboardVolunteersGrouped,
  IDashboardVolunteersGrouped,
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
  ): Promise<IDashboardVolunteersGrouped[]>;
  countVolunteersHours(
    organizationId: string,
  ): Promise<IDashboardVolunteersHours>;
  countVolunteersStatus(
    organizationId: string,
  ): Promise<IDashboardVolunteersStatus>;
}
