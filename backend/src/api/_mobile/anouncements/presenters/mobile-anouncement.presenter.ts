import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';

export class MobileAnouncementPresenter {
  constructor(anouncement: IAnnouncementModel) {
    this.id = anouncement.id;
    this.title = anouncement.name;
    this.description = anouncement.description;
    this.organizationLogo = anouncement?.organization.logo || '';
    this.type = anouncement.type;
    this.volunteersNeeded = anouncement.volunteersNeeded ?? null;
    this.displayEndDate = anouncement.displayEndDate ?? null;
  }

  @Expose()
  @ApiProperty({ enum: AnnouncementType })
  type: AnnouncementType;

  @Expose()
  @ApiProperty({ description: 'Number of volunteers needed', nullable: true })
  volunteersNeeded: number;

  @Expose()
  @ApiProperty({ description: 'Shown until this date', nullable: true })
  displayEndDate: Date;

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
