import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CountPendingContractsUsecase } from '../documents/count-pending-contracts.usecase';

export interface IDashboardOverview {
  activeVolunteers: number;
  pendingAccessRequests: number;
  upcomingEvents: number;
  pendingContracts: number;
  approvedHours: number;
  pendingHours: number;
}

export interface IDashboardUpcomingEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isPublic: boolean;
  going: number;
  capacity: number | null;
}

export interface IDashboardAnnouncementResponse {
  id: string;
  comment: string;
  createdOn: Date;
  announcementId: string;
  announcementName: string;
  volunteerId: string | null;
  volunteerName: string;
}

const DASHBOARD_LIST_SIZE = 3;

// VIC 2.0, #466 and #467: the dashboard's four counters, the next events and the latest responses
// to announcements, for the admin's organization.
@Injectable()
export class GetDashboardOverviewUsecase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly countPendingContractsUsecase: CountPendingContractsUsecase,
  ) {}

  public async overview(organizationId: string): Promise<IDashboardOverview> {
    const [row] = await this.dataSource.query(
      `SELECT
         (SELECT COUNT(*) FROM volunteer
           WHERE organization_id = $1 AND status = 'active' AND deleted_on IS NULL) AS "activeVolunteers",
         (SELECT COUNT(*) FROM access_request
           WHERE organization_id = $1 AND status = 'pending' AND deleted_on IS NULL) AS "pendingAccessRequests",
         (SELECT COUNT(*) FROM event
           WHERE organization_id = $1 AND status = 'published' AND deleted_on IS NULL
             AND start_date >= now()) AS "upcomingEvents",
         (SELECT COALESCE(SUM(hours), 0) FROM activity_log
           WHERE organization_id = $1 AND status = 'approved' AND deleted_on IS NULL) AS "approvedHours",
         (SELECT COALESCE(SUM(l.hours), 0) FROM activity_log l JOIN volunteer v ON v.id = l.volunteer_id
           WHERE l.organization_id = $1 AND l.status = 'pending' AND l.deleted_on IS NULL
             AND v.status = 'active') AS "pendingHours"`,
      [organizationId],
    );
    return {
      activeVolunteers: +row.activeVolunteers,
      pendingAccessRequests: +row.pendingAccessRequests,
      upcomingEvents: +row.upcomingEvents,
      pendingContracts: await this.countPendingContractsUsecase.execute({
        organizationId,
      }),
      approvedHours: +row.approvedHours,
      pendingHours: +row.pendingHours,
    };
  }

  // #467: the next published events (not started yet), with approved registrations against the capacity
  public async upcomingEvents(
    organizationId: string,
  ): Promise<IDashboardUpcomingEvent[]> {
    const rows = await this.dataSource.query(
      `SELECT e.id, e.name, e.start_date AS "startDate", e.end_date AS "endDate",
              e.location, e.is_public AS "isPublic", e.capacity,
              (SELECT COUNT(*) FROM event_rsvp r
                WHERE r.event_id = e.id AND r.going AND r.status = 'approved'
                  AND r.deleted_on IS NULL)::int AS going
         FROM event e
        WHERE e.organization_id = $1 AND e.status = 'published' AND e.deleted_on IS NULL
          AND e.start_date >= now()
        ORDER BY e.start_date ASC, e.id
        LIMIT $2`,
      [organizationId, DASHBOARD_LIST_SIZE],
    );
    return rows.map((row: IDashboardUpcomingEvent) => ({
      ...row,
      capacity: row.capacity ?? null,
    }));
  }

  // #467: the latest responses volunteers left on the organization's announcements
  public async latestResponses(
    organizationId: string,
  ): Promise<IDashboardAnnouncementResponse[]> {
    return this.dataSource.query(
      `SELECT r.id, r.comment, r.created_on AS "createdOn",
              a.id AS "announcementId", a.name AS "announcementName",
              r.volunteer_id AS "volunteerId", u.name AS "volunteerName"
         FROM announcement_response r
         JOIN announcement a ON a.id = r.announcement_id AND a.deleted_on IS NULL
         JOIN "user" u ON u.id = r.user_id
        WHERE a.organization_id = $1 AND r.deleted_on IS NULL
        ORDER BY r.created_on DESC, r.id
        LIMIT $2`,
      [organizationId, DASHBOARD_LIST_SIZE],
    );
  }
}
