import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IDashboardVolunteersStatus } from 'src/modules/dashboard/model/dashboard.model';

export class VolunteerStatusPresenter {
  constructor(data: IDashboardVolunteersStatus) {
    this.activeVolunteers = data.activeVolunteers;
    this.pendingRequest = data.pendingRequest;
  }

  @Expose()
  @ApiProperty({
    description: 'Number of active volunteers',
  })
  activeVolunteers: number;

  @Expose()
  @ApiProperty({
    description: 'Number of pending access requests',
  })
  pendingRequest: number;
}
