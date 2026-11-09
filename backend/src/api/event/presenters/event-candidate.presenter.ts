import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IEventCandidateModel } from 'src/modules/event/models/event.model';

// #496
export class EventCandidatePresenter {
  constructor(candidate: IEventCandidateModel) {
    this.volunteerId = candidate.volunteerId;
    this.name = candidate.name;
    this.email = candidate.email;
    this.department = candidate.department ?? null;
    this.totalHours = candidate.totalHours;
    this.registered = candidate.registered;
  }

  @Expose()
  @ApiProperty()
  volunteerId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ nullable: true })
  department: string | null;

  @Expose()
  @ApiProperty({ description: 'Approved hours in the organization' })
  totalHours: number;

  @Expose()
  @ApiProperty({ description: 'Already going to the event' })
  registered: boolean;
}

export class EventCandidatesPresenter {
  constructor(result: {
    items: IEventCandidateModel[];
    placesLeft: number | null;
  }) {
    this.items = result.items.map((item) => new EventCandidatePresenter(item));
    this.placesLeft = result.placesLeft;
  }

  @Expose()
  @ApiProperty({ type: [EventCandidatePresenter] })
  items: EventCandidatePresenter[];

  @Expose()
  @ApiProperty({ nullable: true, description: 'null: no capacity' })
  placesLeft: number | null;
}
