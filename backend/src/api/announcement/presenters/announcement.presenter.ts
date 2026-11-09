import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';

export class AnnouncementPresenter {
  constructor(announcement: IAnnouncementModel) {
    this.id = announcement.id;
    this.name = announcement.name;
    this.description = announcement.description;
    this.status = announcement.status;
    this.type = announcement.type;
    this.volunteersNeeded = announcement.volunteersNeeded ?? null;
    this.displayStartDate = announcement.displayStartDate;
    this.displayEndDate = announcement.displayEndDate ?? null;
    this.publishedOn = announcement.publishedOn;
    this.archivedOn = announcement.archivedOn ?? null;
    this.updatedOn = announcement.updatedOn;
    this.targetedVolunteers = announcement.targetedVolunteers;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Announcement',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the Announcement',
    example: 'Campanii noi',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The description of the Announcement',
    example: 'Lorem ipsum',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'The status of the Announcement',
    enum: AnnouncementStatus,
    example: Object.values(AnnouncementStatus),
  })
  status: AnnouncementStatus;

  @Expose()
  @ApiProperty({
    description: 'When the Announcement was published',
    nullable: true,
    example: '2020-05-12T23:50:21.817Z',
  })
  publishedOn: Date;

  @Expose()
  @ApiProperty({ enum: AnnouncementType })
  type: AnnouncementType;

  @Expose()
  @ApiProperty({
    description: 'Number of volunteers needed',
    nullable: true,
  })
  volunteersNeeded: number;

  @Expose()
  @ApiProperty({ description: 'Shown in mobile from this date' })
  displayStartDate: Date;

  @Expose()
  @ApiProperty({
    description: 'Shown in mobile until this date (null = no end)',
    nullable: true,
  })
  displayEndDate: Date;

  @Expose()
  @ApiProperty({ description: 'When it was archived', nullable: true })
  archivedOn: Date;

  @Expose()
  @ApiProperty({
    description: 'When the Announcement was last updated',
    example: '2020-05-12T23:50:21.817Z',
  })
  updatedOn: Date;

  @Expose()
  @ApiProperty({
    description: 'Total number of volunteers being targeted',
    example: 100,
  })
  targetedVolunteers: number;
}
