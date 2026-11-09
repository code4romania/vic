import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';

export interface IVolunteerEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  // approved hours the volunteer logged on this event
  hours: number;
}

export interface IVolunteerEvents {
  upcoming: IVolunteerEvent[];
  finished: IVolunteerEvent[];
}

export interface IVolunteerStats {
  totalHours: number;
  events: number;
}

// #485 / #480: the events a volunteer takes part in, in their organization: published or archived
// events where their registration was approved. An event is finished once its end date has passed
// (or, with no end date, its start date) or when it is archived; the rest are upcoming or ongoing.
@Injectable()
export class GetVolunteerEventsUseCase
  implements IUseCaseService<IVolunteerEvents>
{
  constructor(
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly dataSource: DataSource,
  ) {}

  public async execute(volunteerId: string): Promise<IVolunteerEvents> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);
    if (!volunteer.user?.id) return { upcoming: [], finished: [] };

    const rows: (Omit<IVolunteerEvent, 'hours'> & {
      hours: string;
      finished: boolean;
    })[] = await this.dataSource.query(
      `SELECT e.id, e.name, e.start_date AS "startDate", e.end_date AS "endDate", e.location,
              COALESCE((SELECT SUM(l.hours) FROM activity_log l
                        WHERE l.event_id = e.id AND l.volunteer_id = $3 AND l.status = 'approved'), 0) AS hours,
              (e.status = 'archived' OR COALESCE(e.end_date, e.start_date) < now()) AS finished
         FROM event e
         JOIN event_rsvp r ON r.event_id = e.id
        WHERE r.user_id = $1 AND e.organization_id = $2
          AND r.going = true AND r.status = 'approved'
          AND e.status IN ('published', 'archived')
        ORDER BY e.start_date DESC`,
      [volunteer.user.id, volunteer.organization.id, volunteer.id],
    );

    const toEvent = (row: (typeof rows)[number]): IVolunteerEvent => ({
      id: row.id,
      name: row.name,
      startDate: row.startDate,
      endDate: row.endDate,
      location: row.location,
      hours: +row.hours,
    });

    return {
      // the nearest upcoming event first
      upcoming: rows
        .filter((row) => !row.finished)
        .reverse()
        .map(toEvent),
      finished: rows.filter((row) => row.finished).map(toEvent),
    };
  }

  public async stats(volunteerId: string): Promise<IVolunteerStats> {
    const { upcoming, finished } = await this.execute(volunteerId);
    const [{ total }] = await this.dataSource.query(
      `SELECT COALESCE(SUM(hours), 0) AS total FROM activity_log WHERE volunteer_id = $1 AND status = 'approved'`,
      [volunteerId],
    );
    return { totalHours: +total, events: upcoming.length + finished.length };
  }
}
