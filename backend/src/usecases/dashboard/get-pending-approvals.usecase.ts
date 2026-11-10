import { eventEndSql } from 'src/modules/event/event-end';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';

export interface IPendingApprovals {
  accessRequests: number;
  activityLogs: number;
  eventRegistrations: number;
  total: number;
}

// #499 / #468: what waits for the NGO's decision, per type and in total. One query, used by the
// approvals page and the dashboard.
@Injectable()
export class GetPendingApprovalsUseCase
  implements IUseCaseService<IPendingApprovals>
{
  constructor(private readonly dataSource: DataSource) {}

  public async execute(organizationId: string): Promise<IPendingApprovals> {
    // M10: only what can still be decided: hours of active volunteers (an inactive or blocked
    // volunteer's hours are read-only) and registrations to events that have not ended
    const [row] = await this.dataSource.query(
      `SELECT
         (SELECT COUNT(*) FROM access_request
           WHERE organization_id = $1 AND status = 'pending' AND deleted_on IS NULL) AS "accessRequests",
         (SELECT COUNT(*) FROM activity_log l JOIN volunteer v ON v.id = l.volunteer_id
           WHERE l.organization_id = $1 AND l.status = 'pending' AND l.deleted_on IS NULL
             AND v.status = 'active') AS "activityLogs",
         (SELECT COUNT(*) FROM event_rsvp r JOIN event e ON e.id = r.event_id
           WHERE e.organization_id = $1 AND r.going = true AND r.status = 'pending'
             AND r.deleted_on IS NULL AND e.deleted_on IS NULL
             AND ${eventEndSql('e.start_date', 'e.end_date')} > now()) AS "eventRegistrations"`,
      [organizationId],
    );
    const counts = {
      accessRequests: +row.accessRequests,
      activityLogs: +row.activityLogs,
      eventRegistrations: +row.eventRegistrations,
    };
    return {
      ...counts,
      total:
        counts.accessRequests + counts.activityLogs + counts.eventRegistrations,
    };
  }
}
