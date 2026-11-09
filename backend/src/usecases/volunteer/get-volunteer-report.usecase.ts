import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import {
  renderVolunteerReport,
  reportDate,
} from 'src/modules/volunteer/services/volunteer-report.pdf';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';
import { GetVolunteerEventsUseCase } from './get-volunteer-events.usecase';

export interface IVolunteerReport {
  fileName: string;
  pdf: Buffer;
}

const VOLUNTEER_STATUS: Record<VolunteerStatus, string> = {
  [VolunteerStatus.ACTIVE]: 'Activ',
  [VolunteerStatus.INACTIVE]: 'Inactiv',
  [VolunteerStatus.BLOCKED]: 'Blocat',
  [VolunteerStatus.CANDIDATE]: 'Candidat',
};

// "Ana Ștefănescu" -> "Raport-Ana-Stefanescu.pdf", safe in a Content-Disposition header
export const reportFileName = (name: string): string =>
  `Raport-${
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'voluntar'
  }.pdf`;

// #479: "Descarcă raport complet (PDF)": profile, activities, hours history and events.
@Injectable()
export class GetVolunteerReportUseCase {
  constructor(
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly getVolunteerEventsUseCase: GetVolunteerEventsUseCase,
    private readonly dataSource: DataSource,
  ) {}

  public async execute(volunteerId: string): Promise<IVolunteerReport> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);
    const { upcoming, finished } =
      await this.getVolunteerEventsUseCase.execute(volunteerId);

    const logs: {
      date: Date;
      hours: number;
      status: string;
      activity: string | null;
      event: string | null;
    }[] = await this.dataSource.query(
      `SELECT l.date, l.hours, l.status, t.name AS activity, e.name AS event
         FROM activity_log l
         LEFT JOIN activity_type t ON t.id = l.activity_type_id
         LEFT JOIN event e ON e.id = l.event_id
        WHERE l.volunteer_id = $1 AND l.deleted_on IS NULL
        ORDER BY l.date DESC, l.created_on DESC`,
      [volunteerId],
    );

    const sum = (status: string): number =>
      logs
        .filter((log) => log.status === status)
        .reduce((total, log) => total + +log.hours, 0);
    const activities = new Map<string, { hours: number; entries: number }>();
    logs.forEach((log) => {
      const name = log.activity || 'Fără tip de activitate';
      const current = activities.get(name) ?? { hours: 0, entries: 0 };
      activities.set(name, {
        hours: current.hours + (log.status === 'approved' ? +log.hours : 0),
        entries: current.entries + 1,
      });
    });

    const { user, volunteerProfile: profile, organization } = volunteer;
    const name = user?.name ?? '';
    const location = user?.location
      ? `${user.location.name}${
          user.location.county ? `, ${user.location.county.name}` : ''
        }`
      : '';

    const pdf = await renderVolunteerReport({
      organization: organization.name,
      generatedOn: new Date(),
      profile: [
        { label: 'Nume', value: name },
        { label: 'Email', value: profile?.email || user?.email },
        { label: 'Telefon', value: user?.phone },
        { label: 'Data nașterii', value: reportDate(user?.birthday ?? null) },
        { label: 'Localitate', value: location },
        {
          label: 'Status',
          value: VOLUNTEER_STATUS[volunteer.status] ?? volunteer.status,
        },
        { label: 'Rol', value: profile?.role?.name },
        { label: 'Departament', value: profile?.department?.name },
        { label: 'Filială', value: profile?.branch?.name },
        {
          label: 'Activ din',
          value: reportDate(profile?.activeSince ?? null),
        },
        {
          label: 'În organizație din',
          value: reportDate(volunteer.createdOn),
        },
      ],
      stats: [
        { label: 'Ore aprobate', value: `${sum('approved')}` },
        { label: 'Ore în așteptare', value: `${sum('pending')}` },
        {
          label: 'Evenimente',
          value: `${upcoming.length + finished.length}`,
        },
      ],
      activities: [...activities.entries()]
        .map(([activity, totals]) => ({ name: activity, ...totals }))
        .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name)),
      logs,
      upcomingEvents: upcoming,
      finishedEvents: finished,
    });

    return { fileName: reportFileName(name), pdf };
  }
}
