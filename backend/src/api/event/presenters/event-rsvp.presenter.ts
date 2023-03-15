import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventRSVPModel } from 'src/modules/event/models/event-rsvp.model';

export class EventRSVPPresenter {
  constructor(rsvp: IEventRSVPModel) {
    this.id = rsvp.id;

    this.going = rsvp.going;
    this.mention = rsvp.mention;

    this.userName = rsvp.user?.name || '';

    this.createdOn = rsvp.createdOn;
    this.updatedOn = rsvp.updatedOn;

    this.volunteerId = rsvp.volunteerId;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Yes or No' })
  going: boolean;

  @Expose()
  @ApiProperty({ description: 'The RSVP mention' })
  mention: string;

  @Expose()
  @ApiProperty({ description: 'The username' })
  userName: string;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;

  @Expose()
  @ApiProperty({ description: 'Volunteer Id' })
  volunteerId: string;
}
