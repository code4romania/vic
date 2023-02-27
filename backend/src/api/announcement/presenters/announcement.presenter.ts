import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';

class OrganizationStructureToAnnouncementPresenter {
  @Expose()
  @ApiProperty({
    description: 'The uuid of the Organization Structure',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the OrganizationStructure',
    example: 'Financial',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The type of the structure (branch/department/role)',
    enum: OrganizationStructureType,
    examples: Object.values(OrganizationStructureType),
  })
  type: OrganizationStructureType;

  @Expose()
  @ApiProperty({
    description: 'Number of members belonging to the organization structure',
    example: 20,
  })
  members: number;

  static fromAnnouncement(
    structure: IOrganizationStructureModel,
  ): OrganizationStructureToAnnouncementPresenter {
    if (!structure) return null;
    return {
      id: structure.id,
      name: structure.name,
      type: structure.type,
      members: structure.members,
    };
  }
}

export class AnnouncementPresenter {
  constructor(announcement: IAnnouncementModel) {
    this.id = announcement.id;
    this.name = announcement.name;
    this.description = announcement.description;
    this.status = announcement.status;
    this.publishedOn = announcement.publishedOn;
    this.targets = announcement.targets.map(
      OrganizationStructureToAnnouncementPresenter.fromAnnouncement,
    );
    this.updatedOn = announcement.updatedOn;
    this.volunteerTargets = announcement.volunteerTargets;
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
    type: OrganizationStructureToAnnouncementPresenter,
    isArray: true,
  })
  targets: OrganizationStructureToAnnouncementPresenter[];

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
  volunteerTargets: number;
}
