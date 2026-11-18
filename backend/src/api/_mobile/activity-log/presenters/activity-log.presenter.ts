import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { MobileActivityLogListItemPresenter } from './activity-log-list-item-presenter';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { bucharestDay } from 'src/common/helpers/bucharest-time';
import { OrganizationWithVolunteersPresenter } from '../../organization/presenters/organization-with-volunteers.presenter';

// The day of the approval in Romania, as the app reads it ("18/11/2026"): the server runs in UTC, so a
// decision taken after midnight in Bucharest showed the day before (#707).
const slashDay = (instant: Date): string => {
  const [year, month, day] = bucharestDay(new Date(instant)).split('-');
  return `${day}/${month}/${year}`;
};

export class MobileActivityLogPresenter extends MobileActivityLogListItemPresenter {
  constructor(log: IActivityLogModel) {
    super({
      id: log.id,
      date: log.date,
      event: log.event,
      activityType: log.activityType,
      hours: log.hours,
      status: log.status,
      createdOn: log.createdOn,
    });
    this.status = log.status;
    this.approvedOn = log.approvedOn ? slashDay(log.approvedOn) : '';
    this.rejectedOn = log.rejectedOn ? slashDay(log.rejectedOn) : '';
    this.rejectionReason = log.rejectionReason;
    this.mentions = log.mentions;
    this.organization = log.organization
      ? new OrganizationWithVolunteersPresenter({
          ...log.organization,
          numberOfVolunteers: 0,
        })
      : null;
  }

  @Expose()
  @ApiProperty({ description: 'Mentions about the logged hours' })
  mentions?: string;

  @Expose()
  @ApiProperty({
    description: 'The status of the Activity Log',
    enum: ActivityLogStatus,
    examples: Object.values(ActivityLogStatus),
  })
  status: ActivityLogStatus;

  @Expose()
  @ApiProperty({ description: 'Date when the request was approved' })
  approvedOn?: string;

  @Expose()
  @ApiProperty({ description: 'Date when the request was rejected' })
  rejectedOn?: string;

  @Expose()
  @ApiProperty({ description: 'Reason why the log was rejected' })
  rejectionReason?: string;

  @Expose()
  @ApiProperty({ description: 'Organization' })
  organization?: OrganizationWithVolunteersPresenter;
}
