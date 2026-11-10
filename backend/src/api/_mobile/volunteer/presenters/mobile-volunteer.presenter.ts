import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerProfilePresenter } from 'src/api/volunteer/presenters/volunteer-profile.presenter';
import { RegularUserPresenter } from 'src/api/auth/presenters/user.presenter';
import { OrganizationProfilePresenter } from 'src/api/_mobile/organization/presenters/organization-profile.presenter';

// The volunteer as the volunteer themselves sees it in the app. Without what only the NGO sees:
// internal notes (#471), source, favorite, and which admin made them inactive or blocked them.
export class MobileVolunteerPresenter {
  constructor(volunteer: IVolunteerModel) {
    this.id = volunteer.id;
    this.status = volunteer.status;

    this.profile = volunteer.volunteerProfile
      ? new VolunteerProfilePresenter(volunteer.volunteerProfile)
      : null;
    this.organizationId = volunteer.organization?.id;
    this.organization = volunteer.organization
      ? new OrganizationProfilePresenter(volunteer.organization)
      : null;
    this.user = volunteer.user
      ? new RegularUserPresenter(volunteer.user)
      : null;

    this.createdOn = volunteer.createdOn;
    this.updatedOn = volunteer.updatedOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the volunteer',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The status',
    enum: VolunteerStatus,
    examples: Object.values(VolunteerStatus),
  })
  status: VolunteerStatus;

  @Expose()
  @ApiProperty({ description: 'Profile of the volunteer' })
  profile: VolunteerProfilePresenter;

  @Expose()
  @ApiProperty({ type: OrganizationProfilePresenter })
  organization: OrganizationProfilePresenter;

  @Expose()
  @ApiProperty({ description: 'The uuid of the organization' })
  organizationId: string;

  @Expose()
  @ApiProperty({
    type: RegularUserPresenter,
    description: 'The user (the volunteer themselves)',
  })
  user: RegularUserPresenter;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of the last change' })
  updatedOn: Date;
}
