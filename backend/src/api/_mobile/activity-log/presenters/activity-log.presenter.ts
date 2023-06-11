import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { MobileActivityLogListItemPresenter } from './activity-log-list-item-presenter';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { format } from 'date-fns';

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
    this.approvedOn = log.approvedOn ? format(log.approvedOn, 'dd/MM/y') : '';
    this.rejectedOn = log.rejectedOn ? format(log.rejectedOn, 'dd/MM/y') : '';
    this.rejectionReason = log.rejectionReason;
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
}
