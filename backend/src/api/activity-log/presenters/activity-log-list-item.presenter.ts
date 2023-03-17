import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventModel } from 'src/modules/event/models/event.model';
import { IActivityLogListItemModel } from 'src/modules/activity-log/models/activity-log.model';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeListItemWithIconPresenter } from 'src/api/activity-type/presenters/activity-type-list-item.presenter';

export class ActivityLogListItemPresenter {
  constructor(log: IActivityLogListItemModel) {
    this.id = log.id;

    this.date = log.date;
    this.hours = log.hours;
    this.status = log.status;

    this.volunteer = log.volunteer
      ? new IdAndNamePresenter({
          id: log.volunteer.id,
          name: log.volunteer.name,
        })
      : null;

    this.activityType = log.activityType
      ? new ActivityTypeListItemWithIconPresenter(
          log.activityType as IActivityTypeModel,
        )
      : null;

    this.event = log.event ? new IdAndNamePresenter(log.event) : null;

    this.createdOn = log.createdOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Event',
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
  @ApiProperty({ description: 'Volunteer who worked' })
  volunteer: IdAndNamePresenter<IVolunteerModel & IRegularUserModel>; // ID from volunteer, name from user

  @Expose()
  @ApiProperty({ description: 'The activity type/task done by the volunteer' })
  activityType: ActivityTypeListItemWithIconPresenter;

  @Expose()
  @ApiProperty({ description: 'Event where the hours were worked' })
  event?: IdAndNamePresenter<IEventModel>;

  @Expose()
  @ApiProperty({ description: 'When the activity log was registered' })
  createdOn: Date;
}
