import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventModel } from 'src/modules/event/models/event.model';

export class MobileEventListItemPresenter {
  constructor(event: IEventModel) {
    this.id = event.id;
    this.name = event.name;
    this.image =
      'https://emoji.slack-edge.com/TFMSWR5JT/dragos/584b8f200c433c5e.jpg';

    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.isPublic = event.isPublic;

    this.location = event.location;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The event name',
    example: 'Event Name',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The event location/address',
  })
  location: string;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the Event' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the Event' })
  endDate: Date;

  @Expose()
  @ApiProperty({ description: 'The image of the Event' })
  image: string;

  @Expose()
  @ApiProperty({ description: 'Wether the event is public or not' })
  isPublic: boolean;
}
