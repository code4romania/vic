import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityLogListItemModel } from 'src/modules/activity-log/models/activity-log.model';
import { format } from 'date-fns';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IEventModel } from 'src/modules/event/models/event.model';
import { ActivityTypeListItemWithIconPresenter } from 'src/api/activity-type/presenters/activity-type-list-item.presenter';

export class MobileActivityLogListItemPresenter {
  constructor(log: Omit<IActivityLogListItemModel, 'volunteer'>) {
    this.id = log.id;
    this.date = format(log.date, 'dd.MM.y');
    this.hours = log.hours;
    this.activityType = log.activityType
      ? new ActivityTypeListItemWithIconPresenter(
          log.activityType as IActivityTypeModel,
        )
      : null;
    this.event = log.event ? new IdAndNamePresenter(log.event) : null;
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
    example: '12.12.2022',
  })
  date: string;

  @Expose()
  @ApiProperty({
    description: 'Number of hours worked',
    example: 5,
  })
  hours: number;

  @Expose()
  @ApiProperty({ description: 'The activity type/task done by the volunteer' })
  activityType: ActivityTypeListItemWithIconPresenter;

  @Expose()
  @ApiProperty({ description: 'Event where the hours were worked' })
  event?: IdAndNamePresenter<IEventModel>;
}
