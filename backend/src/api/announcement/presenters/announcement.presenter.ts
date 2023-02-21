import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';

export class AnnouncementPresenter {
  constructor(structure: IAnnouncementModel) {
    this.id = structure.id;
    this.name = structure.name;
    this.description = structure.description;
    this.status = structure.status;
    this.publishedOn = structure.publishedOn;
    this.targets = structure.targets;
    this.updatedOn = structure.updatedOn;
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
  @ApiProperty({
    description: 'Targets of the Announcement',
    nullable: true,
  })
  targets: IOrganizationStructureModel[];

  @Expose()
  @ApiProperty({
    description: 'When the Announcement was last updated',
    example: '2020-05-12T23:50:21.817Z',
  })
  updatedOn: Date;
}
