import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityLogCountHoursByStatus } from 'src/modules/activity-log/models/activity-log.model';

export class ActivityLogCountersPresenter {
  constructor(log: IActivityLogCountHoursByStatus) {
    this.pending = log.pending;
    this.approved = log.approved;
    this.rejected = log.rejected;
  }

  @Expose()
  @ApiProperty({ description: 'Pending log count' })
  pending: number;

  @Expose()
  @ApiProperty({ description: 'Approved log count' })
  approved: number;

  @Expose()
  @ApiProperty({ description: 'Rejected log count' })
  rejected: number;
}
