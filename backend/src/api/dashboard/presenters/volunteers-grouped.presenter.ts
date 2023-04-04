import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IDashaboardVolunteersGrouped } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteersGroupedPresenter {
  constructor(data: IDashaboardVolunteersGrouped) {
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
