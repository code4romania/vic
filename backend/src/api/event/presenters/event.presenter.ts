import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventModel } from 'src/modules/event/models/event.model';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';
import { ActivityTypeListItemPresenter } from 'src/api/activity-type/presenters/activity-type-list-item.presenter';

export class EventPresenter {
  constructor(event: IEventModel) {
    this.id = event.id;

    this.name = event.name;
    this.image = event.poster;
    this.description = event.description;
    this.location = event.location;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.isPublic = event.isPublic;
    this.status = event.status;
    this.attendanceType = event.attendanceType;
    this.attendanceMention = event.attendanceMention;
    this.observation = event.observation;
    this.organizationId = event.organization?.id;

    this.targets = event.targets?.map(
      (target) => new OrganizationStructureListItemPresenter(target),
    );

    this.tasks = event.tasks?.map(
      (task) => new ActivityTypeListItemPresenter(task),
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
  @ApiProperty({ description: 'The image of the Event' })
  image: string;

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
    description: 'The type of attendance',
    enum: EventAttendOptions,
    examples: Object.values(EventAttendOptions),
  })
  attendanceType: EventAttendOptions;

  @Expose()
  @ApiProperty({ description: 'The attendance mention' })
  attendanceMention?: string;

  @Expose()
  @ApiProperty({ description: 'Event observations.' })
  observation?: string;

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
  @ApiProperty({
    type: ActivityTypeListItemPresenter,
    isArray: true,
  })
  tasks: ActivityTypeListItemPresenter[];

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
