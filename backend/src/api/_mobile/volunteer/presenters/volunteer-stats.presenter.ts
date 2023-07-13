import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerStats } from 'src/modules/volunteer/model/volunteer.model';

export class VolunteerStatsPresenter {
  constructor(stats: IVolunteerStats) {
    this.volunteerId = stats.volunteerId;
    this.volunteerProfileId = stats.volunteerProfileId;
    this.contractCount = stats.contractCount;
    this.activityLogCount = stats.activityLogCount;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the volunteer',
  })
  volunteerId: string;

  @Expose()
  @ApiProperty({
    description: 'The uuid of the volunteer profile',
  })
  volunteerProfileId: string | null;

  @Expose()
  @ApiProperty({
    description: 'Number of pending logs hours',
  })
  activityLogCount: number;

  @Expose()
  @ApiProperty({
    description: 'Number of pending contracts',
  })
  contractCount: number;
}
