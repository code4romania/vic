import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { IActionArchiveModel } from 'src/modules/actions-archive/models/actions-archive.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import {
  TrackedEventData,
  TrackedEventName,
} from 'src/modules/actions-archive/enums/action-resource-types.enum';

export class ActionArchiveListItemPresenter {
  constructor(action: IActionArchiveModel) {
    this.id = action.id;

    this.author = new IdAndNamePresenter(action.author);
    this.eventName = action.eventName;
    this.eventData = action.eventData;

    this.changes = action.changes;

    this.createdOn = action.createdOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The action s author' })
  author: IdAndNamePresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'The name of the tracked action' })
  eventName: TrackedEventName;

  @Expose()
  @ApiProperty({ description: 'The data associated with the event' })
  eventData: TrackedEventData[TrackedEventName];

  @Expose()
  @ApiProperty({
    description:
      'The diff/changes between the original and the updated resource. For edit event',
  })
  changes: unknown;

  @Expose()
  @ApiProperty({ description: 'When the activity log was registered' })
  createdOn: Date;
}
