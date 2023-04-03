import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IDashboardVolunteersStatus } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteerStatusPresenter {
  constructor(data: IDashboardVolunteersStatus) {
    this.active = data.active;
    this.pending = data.pending;
  }

  @Expose()
  @ApiProperty({
    description: 'Number of active volunteers',
  })
  active: number;

  @Expose()
  @ApiProperty({
    description: 'Number of pending access requests',
  })
  pending: number;
}
