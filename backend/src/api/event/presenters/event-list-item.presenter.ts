import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventsListItemModel } from 'src/modules/event/models/event.model';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';

export class EventListItemPresenter {
  constructor(event: IEventsListItemModel) {
    this.id = event.id;

    this.name = event.name;
    this.image =
      'https://emoji.slack-edge.com/TFMSWR5JT/dragos/584b8f200c433c5e.jpg';

    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.status = event.status;
    this.isPublic = event.isPublic;
    this.location = event.location;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );

    this.going = event.going;
    this.notGoing = event.notGoing;

    this.activityLogged = event.activityLogged;
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
  @ApiProperty({ description: 'The location of the Event' })
  location?: string;

  @Expose()
  @ApiProperty({ description: 'The image of the Event' })
  image: string;

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
    type: OrganizationStructureListItemPresenter,
    isArray: true,
  })
  targets: OrganizationStructureListItemPresenter[];

  @Expose()
  @ApiProperty({ description: 'The name volunteers going' })
  going: number;

  @Expose()
  @ApiProperty({ description: 'The name volunteers not going' })
  notGoing: number;

  @Expose()
  @ApiProperty({
    description:
      'Activity logged for this event, containing total hours and total number of distinct volunteers',
    example: {
      totalHours: 10,
      volunteers: 2,
    },
  })
  activityLogged: { totalHours: number; volunteers: number };
}
