import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';

export class ActivityTypeListItemPresenter {
  constructor(activityType: IActivityTypeModel) {
    this.id = activityType.id;
    this.name = activityType.name;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Activity Type',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Name of the activity' })
  name: string;
}
