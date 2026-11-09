import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventModel } from 'src/modules/event/models/event.model';
import {
  EventDisplayStatus,
  EventStatus,
  getEventDisplayStatus,
} from 'src/modules/event/enums/event-status.enum';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';

export class EventPresenter {
  constructor(event: IEventModel) {
    this.id = event.id;

    this.name = event.name;
    this.description = event.description;
    this.location = event.location;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.isPublic = event.isPublic;
    this.status = event.status;
    this.displayStatus = getEventDisplayStatus(event);
    this.capacity = event.capacity ?? null;
    this.organizationId = event.organization?.id;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );

    this.createdOn = event.createdOn;
    this.updatedOn = event.updatedOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The name of the Event' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'The description of the Event' })
  description: string;

  @Expose()
  @ApiProperty({ description: 'The location of the Event' })
  location: string;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the Event' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'The End Date of the Event' })
  endDate?: Date;

  @Expose()
  @ApiProperty({ description: 'Wether the event is public or not' })
  isPublic: boolean;

  @Expose()
  @ApiProperty({
    description: 'The status of the event',
    enum: EventStatus,
    examples: Object.values(EventStatus),
  })
  status: EventStatus;

  @Expose()
  @ApiProperty({
    description:
      'Status to show: a published event past its end date is "finished"',
    enum: EventDisplayStatus,
  })
  displayStatus: EventDisplayStatus;

  @Expose()
  @ApiProperty({
    description: 'Maximum number of registered volunteers (null = no limit)',
    nullable: true,
  })
  capacity: number;

  @Expose()
  @ApiProperty({ description: 'The id of organization who created the event.' })
  organizationId: string;

  @Expose()
  @ApiProperty({
    type: OrganizationStructureListItemPresenter,
    isArray: true,
  })
  targets: OrganizationStructureListItemPresenter[];

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
