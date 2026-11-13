import { ApiProperty } from '@nestjs/swagger';
import { IMyEventsCountsModel } from 'src/modules/event/models/event.model';

export class MobileEventsCountsPresenter {
  constructor(counts: IMyEventsCountsModel) {
    this.open = counts.open;
    this.going = counts.going;
    this.organizations = counts.organizations;
  }

  @ApiProperty({ description: 'Events in the Deschise (OPEN) list' })
  open: number;

  @ApiProperty({ description: 'Events in the Particip (GOING) list' })
  going: number;

  @ApiProperty({
    description: 'Events in the Organizațiile mele (ORGANIZATIONS) list',
  })
  organizations: number;
}
