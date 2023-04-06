import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IDashboardVolunteerStatusTimeseries } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteerStatusTimeseriesPresenter {
  constructor(data: IDashboardVolunteerStatusTimeseries) {
    this.date = data.date;
    this.active = data.active;
    this.archived = data.archived;
  }

  @Expose()
  @ApiProperty({ description: 'Date' })
  date: string;

  @Expose()
  @ApiProperty({ description: 'Number of active volunteers at a given date' })
  active: number;

  @Expose()
  @ApiProperty({ description: 'Number of archived volunteers at a given date' })
  archived: number;
}
