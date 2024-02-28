import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IDashboardVolunteersGrouped } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteersGroupedPresenter {
  constructor(data: IDashboardVolunteersGrouped) {
    this.name = data.name;
    this.count = data.count;
  }

  @Expose()
  @ApiProperty({ description: 'Name of the group' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Number of records from the given group' })
  count: number;
}
