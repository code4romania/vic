import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityLogListItemModel } from 'src/modules/activity-log/models/activity-log.model';
import { format } from 'date-fns';

export class MobileActivityLogListItemPresenter {
  constructor(log: Omit<IActivityLogListItemModel, 'volunteer'>) {
    this.id = log.id;
    this.date = format(log.date, 'dd.MM.y');
    this.hours = log.hours;
    this.activityTypeName = log.activityType.name;
    this.eventName = log.event?.name;
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
  @ApiProperty({
    description: 'The name of the activity',
    example: 'Sort clothes',
  })
  activityTypeName: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the event',
    example: 'Meal for the poor',
  })
  eventName?: string;
}
