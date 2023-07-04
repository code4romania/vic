import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventsMobileListItemModel } from 'src/modules/event/models/event.model';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import { formatEventDate } from '../helpers/event.helper';

export class MobileEventListItemPresenter {
  constructor(event: IEventsMobileListItemModel) {
    this.id = event.id;
    this.name = event.name;
    this.image = event.poster;

    this.isPublic = event.isPublic;

    this.location = event.location;
    this.eventInterval = formatEventDate(event.startDate, event.endDate);
    this.organizationLogo = event.organizationLogo;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );
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
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The event location/address',
  })
  location: string;

  @Expose()
  @ApiProperty({
    description:
      'The interval in which the event occurs, is made of start and end date',
  })
  eventInterval: string;

  @Expose()
  @ApiProperty({ description: 'The image of the Event' })
  image: string;

  @Expose()
  @ApiProperty({ description: 'The organization logo for this event' })
  organizationLogo?: string;

  @Expose()
  @ApiProperty({ description: 'Wether the event is public or not' })
  isPublic: boolean;

  @Expose()
  @ApiProperty({
    type: OrganizationStructureListItemPresenter,
    isArray: true,
  })
  targets: OrganizationStructureListItemPresenter[];
}
