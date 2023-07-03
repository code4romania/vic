import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ITeoStatistics } from 'src/modules/dashboard/model/dashboard.model';

export class TeoStatisticsPresenter {
  constructor(statistics: ITeoStatistics) {
    this.numberOfActiveVolunteers = statistics.numberOfActiveVolunteers;
    this.numberOfOrganizations = statistics.numberOfOrganizations;
  }

  @Expose()
  @ApiProperty({
    description: 'Number of active volunteer in the application now',
    example: 100,
  })
  numberOfActiveVolunteers: number;

  @Expose()
  @ApiProperty({
    description: 'Number of active organization',
    example: 100,
  })
  numberOfOrganizations: number;
}
