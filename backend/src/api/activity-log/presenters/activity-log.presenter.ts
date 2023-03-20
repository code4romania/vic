import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ActivityTypeListItemPresenter } from 'src/api/activity-type/presenters/activity-type-list-item.presenter';
import { AdminUserPresenter } from 'src/api/auth/presenters/admin-user.presenter';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IActivityLogModel } from 'src/modules/activity-log/models/activity-log.model';
import { IEventModel } from 'src/modules/event/models/event.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';

export class ActivityLogPresenter {
  constructor(log: IActivityLogModel) {
    this.id = log.id;

    this.date = log.date;
    this.hours = log.hours;
    this.status = log.status;
    this.mentions = log.mentions;
    this.volunteer = log.volunteer
      ? new IdAndNamePresenter({
          id: log.volunteer.id,
          name: log.volunteer?.user?.name,
        })
      : null;

    this.createdByAdmin = log.createdByAdmin
      ? new AdminUserPresenter(log.createdByAdmin)
      : null;

    this.activityType = log.activityType
      ? new ActivityTypeListItemPresenter(log.activityType)
      : null;

    this.event = log.event ? new IdAndNamePresenter(log.event) : null;

    this.rejectionReason = log.rejectionReason;
    this.rejectedOn = log.rejectedOn;
    this.rejectedBy = log.rejectedBy
      ? new AdminUserPresenter(log.rejectedBy)
      : null;

    this.approvedOn = log.approvedOn;
    this.approvedBy = log.approvedBy
      ? new AdminUserPresenter(log.approvedBy)
      : null;

    this.createdOn = log.createdOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Activity Log',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Execution date of the task',
    example: '2020-05-12T23:50:21.817Z',
  })
  date: Date;

  @Expose()
  @ApiProperty({
    description: 'Number of hours worked',
    example: 5,
  })
  hours: number;

  @Expose()
  @ApiProperty({
    description: 'The status of the Activity Log',
    enum: ActivityLogStatus,
    examples: Object.values(ActivityLogStatus),
  })
  status: ActivityLogStatus;

  @Expose()
  @ApiProperty({ description: 'Mentions about the logged hours' })
  mentions?: string;

  @Expose()
  @ApiProperty({ description: 'Volunteer who worked' })
  volunteer: IdAndNamePresenter<IVolunteerModel & IRegularUserModel>; // ID from volunteer, name from user

  @Expose()
  @ApiProperty({ description: 'Admin who logged the hours' })
  createdByAdmin?: AdminUserPresenter;

  @Expose()
  @ApiProperty({ description: 'The activity type/task done by the volunteer' })
  activityType: ActivityTypeListItemPresenter;

  @Expose()
  @ApiProperty({ description: 'Event where the hours were worked' })
  event?: IdAndNamePresenter<IEventModel>;

  @Expose()
  @ApiProperty({ description: 'Reason why the log was rejected' })
  rejectionReason?: string;

  @Expose()
  @ApiProperty({ description: 'Admin who approved the request' })
  approvedBy?: AdminUserPresenter;

  @Expose()
  @ApiProperty({ description: 'Date when the request was approved' })
  approvedOn?: Date;

  @Expose()
  @ApiProperty({ description: 'Admin who rejected the request' })
  rejectedBy?: AdminUserPresenter;

  @Expose()
  @ApiProperty({ description: 'Date when the request was rejected' })
  rejectedOn?: Date;

  @Expose()
  @ApiProperty({ description: 'When the activity log was registered' })
  createdOn: Date;
}
