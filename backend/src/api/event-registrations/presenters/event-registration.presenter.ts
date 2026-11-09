import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';
import { IEventRegistrationListItem } from 'src/modules/event/models/event-rsvp.model';

export class EventRegistrationPresenter {
  constructor(item: IEventRegistrationListItem) {
    this.id = item.id;
    this.status = item.status;
    this.rejectionReason = item.rejectionReason ?? null;
    this.decidedOn = item.decidedOn ?? null;
    this.decidedByName = item.decidedByName ?? null;
    this.createdOn = item.createdOn;
    this.event = item.event;
    this.user = item.user;
    this.volunteerId = item.volunteerId ?? null;
    this.volunteerStatus = item.volunteerStatus ?? null;
  }

  @Expose()
  @ApiProperty({ description: 'The registration (RSVP) id' })
  id: string;

  @Expose()
  @ApiProperty({ enum: EventRegistrationStatus })
  status: EventRegistrationStatus;

  @Expose()
  @ApiProperty({ nullable: true })
  rejectionReason: string;

  @Expose()
  @ApiProperty({ nullable: true })
  decidedOn: Date;

  @Expose()
  @ApiProperty({ nullable: true, description: 'Who decided' })
  decidedByName: string;

  @Expose()
  @ApiProperty({ description: 'When the volunteer registered' })
  createdOn: Date;

  @Expose()
  @ApiProperty()
  event: { id: string; name: string; startDate: Date };

  @Expose()
  @ApiProperty()
  user: { id: string; name: string; email: string };

  @Expose()
  @ApiProperty({
    nullable: true,
    description: 'The volunteer in the organization, if any',
  })
  volunteerId: string;

  @Expose()
  @ApiProperty({
    nullable: true,
    description:
      "The person's status in the organization (null = not a volunteer there)",
  })
  volunteerStatus: string;
}
