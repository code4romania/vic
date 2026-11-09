import { Injectable } from '@nestjs/common';
import { differenceInYears } from 'date-fns';
import { DataSource } from 'typeorm';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';

export interface IVolunteerPersonalStatistics {
  // approved hours, in every organization
  approvedHours: number;
  // events with an approved "going" registration (published or archived), in every organization
  events: number;
  // when the VIC account was created, and full years since
  memberSince: Date | null;
  yearsInVic: number;
}

// Redesigned mobile Profil: the volunteer's own totals across organizations.
@Injectable()
export class GetVolunteerPersonalStatisticsUsecase
  implements IUseCaseService<IVolunteerPersonalStatistics>
{
  constructor(private readonly dataSource: DataSource) {}

  public async execute(userId: string): Promise<IVolunteerPersonalStatistics> {
    const [row] = await this.dataSource.query(
      `SELECT
         (SELECT COALESCE(SUM(l.hours), 0) FROM activity_log l
            JOIN volunteer v ON v.id = l.volunteer_id
           WHERE v.user_id = $1 AND l.status = 'approved' AND l.deleted_on IS NULL) AS "approvedHours",
         (SELECT COUNT(*) FROM event_rsvp r JOIN event e ON e.id = r.event_id
           WHERE r.user_id = $1 AND r.going = true AND r.status = 'approved'
             AND e.status IN ('published', 'archived')
             AND r.deleted_on IS NULL AND e.deleted_on IS NULL) AS events,
         (SELECT created_on FROM "user" WHERE id = $1) AS "memberSince"`,
      [userId],
    );
    const memberSince: Date | null = row.memberSince ?? null;
    return {
      approvedHours: +row.approvedHours,
      events: +row.events,
      memberSince,
      yearsInVic: memberSince ? differenceInYears(new Date(), memberSince) : 0,
    };
  }
}
