import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerStats } from 'src/modules/volunteer/model/volunteer.model';

export class VolunteerStatsPresenter {
  constructor(stats: IVolunteerStats) {
    this.volunteerId = stats.volunteerId;
    this.volunteerProfileId = stats.volunteerProfileId;
    this.signedContractCount = Number(stats.signedContractCount) || 0;
    // Contracts are uploaded already signed: none waits for the volunteer any more. Kept at 0 for
    // the app versions that still show it as "documente așteaptă răspuns".
    this.contractCount = 0;
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
    description:
      'Deprecated, always 0: contracts are uploaded already signed, none is pending',
  })
  contractCount: number;

  @Expose()
  @ApiProperty({
    description: 'Number of signed contracts still in their period',
  })
  signedContractCount: number;
}
