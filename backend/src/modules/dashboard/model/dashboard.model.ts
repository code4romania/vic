import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { DashboardFilterInterval } from '../enums/dashboard-filter-interval.enum';

export interface IDashboardVolunteerStatusChart {
  date: string;
  status: VolunteerStatus;
  count: number;
  type: DashboardFilterInterval;

  organizationId: string;
}

export interface IDashboardVolunteerStatusTimeseries {
  date: string;
  active: number;
  archived: number;
}

export type FindDashboardVolunteerStatusChartOptions = {
  organizationId: string;
  interval: DashboardFilterInterval;
};
