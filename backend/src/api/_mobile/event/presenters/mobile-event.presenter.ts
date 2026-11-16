import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventWithVolunteerStatus } from 'src/modules/event/models/event.model';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import {
  IEventParticipants,
  PARTICIPANTS_PREVIEW_SIZE,
} from 'src/modules/event/event-participants';
import { formatEventDate } from '../helpers/event.helper';
import { EventVolunteerStatus } from 'src/modules/event/enums/event-volunteer-status.enum';
import {
  EventDisplayStatus,
  getEventDisplayStatus,
} from 'src/modules/event/enums/event-status.enum';

export class EventParticipantPreviewPresenter {
  @Expose()
  @ApiProperty({
    description: 'Initials of a volunteer going to the event (no name)',
    example: 'ȘP',
  })
  initials: string;

  @Expose()
  @ApiProperty({
    description:
      'Picture of the volunteer; not sent today (pictures are not shared between volunteers)',
    required: false,
  })
  avatarUrl?: string;
}

export class EventParticipantsPresenter {
  constructor(participants: IEventParticipants) {
    this.total = participants.total;
    this.preview = participants.preview.map((person) => {
      const item = new EventParticipantPreviewPresenter();
      item.initials = person.initials;
      if (person.avatarUrl) item.avatarUrl = person.avatarUrl;
      return item;
    });
  }

  @Expose()
  @ApiProperty({ description: 'Volunteers going (approved registrations)' })
  total: number;

  @Expose()
  @ApiProperty({
    type: EventParticipantPreviewPresenter,
    isArray: true,
    description: `The first ${PARTICIPANTS_PREVIEW_SIZE} to register, oldest first`,
  })
  preview: EventParticipantPreviewPresenter[];
}

export class MobileEventPresenter {
  constructor(event: IEventWithVolunteerStatus) {
    this.id = event.id;
    this.name = event.name;

    this.isPublic = event.isPublic;

    this.location = event.location;

    this.eventInterval = formatEventDate(event.startDate, event.endDate);
    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.organizationId = event.organization.id;
    this.organizationLogo = event.organization.logo;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );

    this.organizationName = event.organization.name;
    this.description = event.description;

    this.volunteerStatus = event.volunteerStatus;
    this.numberOfPersonsGoingToEvent = event.numberOfPersonsGoingToEvent;
    this.participants = new EventParticipantsPresenter(
      event.participants ?? {
        total: event.numberOfPersonsGoingToEvent ?? 0,
        preview: [],
      },
    );
    this.registrationStatus = event.registrationStatus ?? null;
    this.rejectionReason = event.rejectionReason ?? null;

    this.displayStatus = getEventDisplayStatus(event);
    this.capacity = event.capacity ?? null;
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
  @ApiProperty({ description: 'The uuid of the organization of this event' })
  organizationId: string;

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
      "The NGO's decision on the volunteer's registration: pending, approved or rejected (null when not going)",
    enum: EventRegistrationStatus,
    nullable: true,
  })
  registrationStatus: EventRegistrationStatus;

  @Expose()
  @ApiProperty({
    description: 'Why the registration was rejected',
    nullable: true,
  })
  rejectionReason: string;

  @Expose()
  @ApiProperty({
    description:
      'Number of volunteers who have responded to join to this event',
  })
  numberOfPersonsGoingToEvent: number;

  @Expose()
  @ApiProperty({
    type: EventParticipantsPresenter,
    description:
      'Who is coming, privacy-safe: the count and the initials of the first ones',
  })
  participants: EventParticipantsPresenter;

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
