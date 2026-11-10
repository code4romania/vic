import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IAnnouncementModel } from 'src/modules/announcement/models/announcement.model';
import { AnnouncementType } from 'src/modules/announcement/enums/announcement-type.enum';
import { OrganizationProfilePresenter } from 'src/api/_mobile/organization/presenters/organization-profile.presenter';

export class MobileAnouncementPresenter {
  constructor(
    anouncement: IAnnouncementModel,
    myResponse?: { comment: string; createdOn: Date },
  ) {
    this.myResponse = myResponse ?? null;
    this.id = anouncement.id;
    this.title = anouncement.name;
    this.description = anouncement.description;
    this.organizationLogo = anouncement?.organization?.logo || '';
    this.type = anouncement.type;
    this.volunteersNeeded = anouncement.volunteersNeeded ?? null;
    this.displayEndDate = anouncement.displayEndDate ?? null;
    this.organization = anouncement.organization
      ? new OrganizationProfilePresenter(anouncement.organization)
      : null;
    this.createdOn = anouncement.createdOn;
    this.publishedOn = anouncement.publishedOn ?? null;
  }

  @Expose()
  @ApiProperty({
    type: OrganizationProfilePresenter,
    description: 'The organization that sent it: id, name and logo',
  })
  organization: OrganizationProfilePresenter;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({
    description: 'When it was published (made active)',
    nullable: true,
  })
  publishedOn: Date;

  @Expose()
  @ApiProperty({
    description: "#504: the volunteer's answer, null when not answered yet",
    nullable: true,
  })
  myResponse: { comment: string; createdOn: Date } | null;

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
