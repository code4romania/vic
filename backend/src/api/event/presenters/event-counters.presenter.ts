import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IEventCountersModel } from 'src/modules/event/models/event.model';

export class EventCountersPresenter {
  constructor(counters: IEventCountersModel) {
    this.upcoming = counters.upcoming;
    this.ongoing = counters.ongoing;
    this.participants = counters.participants;
  }

  @Expose()
  @ApiProperty({ description: 'Published events that have not started' })
  upcoming: number;

  @Expose()
  @ApiProperty({
    description: 'Published events that started and have not ended',
  })
  ongoing: number;

  @Expose()
  @ApiProperty({
    description: '"Going" answers on the upcoming and ongoing events',
  })
  participants: number;
}
