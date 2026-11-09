import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventsMobileListItemModel } from 'src/modules/event/models/event.model';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import { formatEventDate } from '../helpers/event.helper';
import {
  EventDisplayStatus,
  getEventDisplayStatus,
} from 'src/modules/event/enums/event-status.enum';

export class MobileEventListItemPresenter {
  constructor(event: IEventsMobileListItemModel) {
    this.id = event.id;
    this.name = event.name;

    this.isPublic = event.isPublic;

    this.location = event.location;
    this.eventInterval = formatEventDate(event.startDate, event.endDate);

    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.organizationLogo = event.organizationLogo;
    this.organizationId = event.organizationId;
    this.organizationName = event.organizationName;
    this.isGoing = !!event.isGoing;
    this.registrationStatus = event.registrationStatus ?? null;

    this.displayStatus = getEventDisplayStatus(event);
    this.capacity = event.capacity ?? null;

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
    description: 'Start date of the event',
  })
  startDate: Date;

  @Expose()
  @ApiProperty({
    description: 'End date of the event',
  })
  endDate: Date;

  // TODO: Deprecate this, remove in the next version. Because of the BE timezone the dates are parsed wrong in the backend we do it in FE.
  @Expose()
  @ApiProperty({
    description:
      'The interval in which the event occurs, is made of start and end date',
  })
  eventInterval: string;

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
  @ApiProperty({ description: 'The organization logo for this event' })
  organizationLogo?: string;

  @Expose()
  @ApiProperty({ description: 'The organization of the event' })
  organizationId: string;

  @Expose()
  @ApiProperty({ description: 'The organization name, shown on the card' })
  organizationName: string;

  @Expose()
  @ApiProperty({
    description:
      'The current user answered "going" and the NGO has not rejected it',
  })
  isGoing: boolean;

  @Expose()
  @ApiProperty({
    enum: EventRegistrationStatus,
    nullable: true,
    description: 'Status of the "going" registration (#501), null without one',
  })
  registrationStatus: EventRegistrationStatus | null;

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
