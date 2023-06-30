import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { MobileEventListItemPresenter } from '../../event/presenters/mobile-event-list-item.presenter';
import { OrganizatinVolunteerStatus } from 'src/modules/organization/enums/organization-volunteer-status.enum';
import { VolunteerPresenter } from 'src/api/volunteer/presenters/volunteer.presenter';

export class OrganizationWithEventsPresenter {
  constructor(organization: IOrganizationWithEventsModel) {
    this.id = organization.id;
    this.name = organization.name;
    this.email = organization.email;
    this.phone = organization.phone;
    this.address = organization.address;
    this.activityArea = organization.activityArea;
    this.logo = organization.logo;
    this.description = organization.description;
    this.numberOfVolunteers = organization.numberOfVolunteers;
    this.events = organization.events.map(
      (event) =>
        new MobileEventListItemPresenter({
          ...event,
          organizationLogo: organization.logo,
        }),
    );
    this.volunteers = organization.volunteers.map(
      (volunteer) => new VolunteerPresenter(volunteer),
    );
    this.organizationVolunteerStatus = organization.organizationVolunteerStatus;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Organization',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the Organization',
    example: 'Crucea Rosie',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The email of the Organization',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'The contact phone of the Organization',
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'The address of the Organization',
  })
  address: string;

  @Expose()
  @ApiProperty({
    description: 'The activity area of the Organization',
  })
  activityArea: string;

  @Expose()
  @ApiProperty({
    description: 'The logo of the Organization',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    description: 'The description phone of the Organization',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'The number of active volunteers in organization',
    example: '10000',
  })
  numberOfVolunteers: number;

  @Expose()
  @ApiProperty({
    description: 'Organization status for this volunteer',
    enum: OrganizatinVolunteerStatus,
    examples: Object.values(OrganizatinVolunteerStatus),
  })
  organizationVolunteerStatus?: OrganizatinVolunteerStatus;

  @Expose()
  @ApiProperty({
    type: MobileEventListItemPresenter,
    isArray: true,
  })
  events: MobileEventListItemPresenter[];

  @Expose()
  @ApiProperty({
    type: VolunteerPresenter,
    isArray: true,
  })
  volunteers: VolunteerPresenter[];
}
