import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';

export class AnnouncementPresenter {
  constructor(announcement: IAnnouncementModel) {
    this.id = announcement.id;
    this.name = announcement.name;
    this.description = announcement.description;
    this.status = announcement.status;
    this.publishedOn = announcement.publishedOn;
    this.targets = announcement.targets.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );
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
  @ApiProperty({
    type: OrganizationStructureListItemPresenter,
    isArray: true,
  })
  targets: OrganizationStructureListItemPresenter[];

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
