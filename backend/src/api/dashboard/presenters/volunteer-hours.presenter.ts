import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IDashboardVolunteersHours } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteerHoursPresenter {
  constructor(data: IDashboardVolunteersHours) {
    this.approved = data.approved;
    this.pending = data.pending;
  }

  @Expose()
  @ApiProperty({
    description: 'Number of approved volunteer hours',
  })
  approved: number;

  @Expose()
  @ApiProperty({
    description: 'Number of pending volunteer hours',
  })
  pending: number;
}
