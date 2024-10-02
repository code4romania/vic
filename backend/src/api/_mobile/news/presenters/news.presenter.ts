import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActionArchiveModel } from 'src/modules/actions-archive/models/actions-archive.model';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';

export class NewsPresenter {
  constructor(item: IActionArchiveModel) {
    this.id = item.id;
    this.organizationLogo = item.author.organization.logo;
    this.organizationName = item.author.organization.name;
    this.activityLogId = (item.eventData as never)['activityLogId'];
    this.contractId = (item.eventData as never)['documentContractId'];
    this.accessRequestId = (item.eventData as never)['accessRequestId'];
    this.organizationId = item.author.organization.id;
    this.eventName = item.eventName;
    this.newStatus = (item.eventData as never)['newStatus'];
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Organization Logo',
  })
  organizationLogo: string;

  @Expose()
  @ApiProperty({ description: 'The organization name' })
  organizationName: string;

  @Expose()
  @ApiProperty({ description: 'The organization id' })
  organizationId?: string;

  @Expose()
  @ApiProperty({ description: 'The activity log id' })
  activityLogId?: string;

  @Expose()
  @ApiProperty({ description: 'The contract id' })
  contractId?: string;

  @Expose()
  @ApiProperty({ description: 'The access request id' })
  accessRequestId?: string;

  @Expose()
  @ApiProperty({
    description: 'Event name',
    enum: TrackedEventName,
    examples: Object.values(TrackedEventName),
  })
  eventName: TrackedEventName;

  @Expose()
  @ApiProperty({
    description: 'New status',
    enum: ActivityLogStatus,
    examples: Object.values(ActivityLogStatus),
  })
  newStatus: ActivityLogStatus;
}
