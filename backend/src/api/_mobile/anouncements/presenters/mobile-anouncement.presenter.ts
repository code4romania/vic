import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';

export class MobileAnouncementPresenter {
  constructor(anouncement: IAnnouncementModel) {
    this.id = anouncement.id;
    this.title = anouncement.name;
    this.description = anouncement.description;
    this.organizationLogo = anouncement?.organization.logo || '';
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
  title: string;

  @Expose()
  @ApiProperty({
    description: 'The event location/address',
  })
  description: string;

  @Expose()
  @ApiProperty({ description: 'The organization logo for this event' })
  organizationLogo?: string;
}
