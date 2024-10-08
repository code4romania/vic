import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventWithVolunteerStatus } from 'src/modules/event/models/event.model';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import { formatEventDate } from '../helpers/event.helper';
import { EventVolunteerStatus } from 'src/modules/event/enums/event-volunteer-status.enum';
import { ActivityTypeListItemPresenter } from 'src/api/activity-type/presenters/activity-type-list-item.presenter';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';

export class MobileEventPresenter {
  constructor(event: IEventWithVolunteerStatus) {
    this.id = event.id;
    this.name = event.name;
    this.poster = event.poster;

    this.isPublic = event.isPublic;

    this.location = event.location;

    this.eventInterval = formatEventDate(event.startDate, event.endDate);
    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.organizationLogo = event.organization.logo;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );

    this.organizationName = event.organization.name;
    this.description = event.description;

    this.tasks = event.tasks?.map(
      (task) => new ActivityTypeListItemPresenter(task),
    );

    this.volunteerStatus = event.volunteerStatus;
    this.numberOfPersonsGoingToEvent = event.numberOfPersonsGoingToEvent;

    this.attendanceType = event.attendanceType;
    this.attendanceMention = event.attendanceMention;
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
  @ApiProperty({
    description: 'Start date of the event',
  })
  startDate: Date;

  @Expose()
  @ApiProperty({
    description: 'End date of the event',
  })
  endDate: Date;

  @Expose()
  @ApiProperty({ description: 'The image of the Event' })
  poster: string;

  @Expose()
  @ApiProperty({ description: 'The organization logo for this event' })
  organizationLogo?: string;

  @Expose()
  @ApiProperty({ description: 'The organization name for this event' })
  organizationName: string;

  @Expose()
  @ApiProperty({ description: 'Event description' })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'The type of attendance',
    enum: EventAttendOptions,
    examples: Object.values(EventAttendOptions),
  })
  attendanceType: EventAttendOptions;

  @Expose()
  @ApiProperty({
    description: 'The attendance mention',
  })
  attendanceMention?: string;

  @Expose()
  @ApiProperty({
    type: ActivityTypeListItemPresenter,
    isArray: true,
  })
  tasks: ActivityTypeListItemPresenter[];

  @Expose()
  @ApiProperty({
    description:
      'The status of the event in relation to the volunteer making the request',
    enum: EventVolunteerStatus,
    examples: Object.values(EventVolunteerStatus),
  })
  volunteerStatus: EventVolunteerStatus;

  @Expose()
  @ApiProperty({
    description:
      'Number of volunteers who have responded to join to this event',
  })
  numberOfPersonsGoingToEvent: number;

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
