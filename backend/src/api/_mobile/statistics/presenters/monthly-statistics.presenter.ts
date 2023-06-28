import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IVolunteerMonthlyStatistics } from 'src/modules/dashboard/model/dashboard.model';

export class MonthlyStatisticsPresenter {
  constructor(statistics: IVolunteerMonthlyStatistics) {
    this.numberOfActivityLogUpdates = statistics.numberOfActivityLogUpdates;
    this.numberOfDocumentUpdates = statistics.numberOfDocumentUpdates;
    this.numberOfOrganizationUpdates = statistics.numberOfOrganizationUpdates;
    this.numberOfUpcomingEvents = statistics.numberOfUpcomingEvents;
  }

  @Expose()
  @ApiProperty({
    description:
      'Number of upcoming events for this user in all his organizations',
    example: 100,
  })
  numberOfUpcomingEvents: number;

  @Expose()
  @ApiProperty({
    description:
      'Number of updates on activity logs for him in all his organizations',
    example: 100,
  })
  numberOfActivityLogUpdates: number;

  @Expose()
  @ApiProperty({
    description:
      'Total number of document updates for him in all his organizations',
    example: 100,
  })
  numberOfDocumentUpdates: number;

  @Expose()
  @ApiProperty({
    description: 'Number of accepted/rejected organization requets',
    example: 100,
  })
  numberOfOrganizationUpdates: number;
}
