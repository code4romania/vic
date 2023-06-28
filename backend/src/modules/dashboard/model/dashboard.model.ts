import { DashboardFilterInterval } from '../enums/dashboard-filter-interval.enum';
import { DashboardFilteringGroups } from '../enums/dashboard-filtering-groups.enum';

export interface IDashboardVolunteerStatusTimeseries {
  date: string;
  active: number;
  archived: number;
}

export interface IDashaboardVolunteersGrouped {
  name: string;
  count: number;
}

export interface IDashboardVolunteersHours {
  approved: number;
  pending: number;
}

export interface IDashboardVolunteersStatus {
  activeVolunteers: number;
  pendingRequest: number;
}

export type FindDashboardVolunteerStatusChartOptions = {
  organizationId: string;
  interval: DashboardFilterInterval;
};

export type FindDashboardVolunteersGrouped = {
  organizationId: string;
  group: DashboardFilteringGroups;
};

export interface IVolunteerMonthlyStatistics {
  numberOfUpcomingEvents: number;
  numberOfActivityLogUpdates: number;
  numberOfDocumentUpdates: number;
  numberOfOrganizationUpdates: number;
}
