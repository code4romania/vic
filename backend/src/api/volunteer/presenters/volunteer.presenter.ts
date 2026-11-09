import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerProfilePresenter } from './volunteer-profile.presenter';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';
import { RegularUserPresenter } from 'src/api/auth/presenters/user.presenter';
import { OrganizationProfilePresenter } from 'src/api/_mobile/organization/presenters/organization-profile.presenter';

export class VolunteerPresenter {
  constructor(volunteer: IVolunteerModel) {
    this.id = volunteer.id;
    this.status = volunteer.status;
    this.source = volunteer.source;
    this.notes = volunteer.notes;
    this.isFavorite = volunteer.isFavorite;
    this.totalHours = volunteer.totalHours;

    this.archivedOn = volunteer.archivedOn;
    this.archivedBy = volunteer.archivedBy
      ? new IdAndNamePresenter<IAdminUserModel>(volunteer.archivedBy)
      : null;

    this.blockedOn = volunteer.blockedOn;
    this.blockedBy = volunteer.blockedBy
      ? new IdAndNamePresenter<IAdminUserModel>(volunteer.blockedBy)
      : null;

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
  @ApiProperty({ description: 'Where the volunteer came from', nullable: true })
  source: string;

  @Expose()
  @ApiProperty({
    description: 'Internal notes of the organization',
    nullable: true,
  })
  notes: string;

  @Expose()
  @ApiProperty({ description: 'Starred by the organization' })
  isFavorite: boolean;

  @Expose()
  @ApiProperty({
    description: 'Approved hours in the organization (volunteers list only)',
    required: false,
  })
  totalHours?: number;

  @Expose()
  @ApiProperty({ description: 'Profile of the volunteer' })
  profile: VolunteerProfilePresenter;

  @Expose()
  @ApiProperty({
    type: OrganizationProfilePresenter,
  })
  organization: OrganizationProfilePresenter;

  @Expose()
  @ApiProperty({ description: 'The uuid of the organization' })
  organizationId: string;

  @Expose()
  @ApiProperty({
    type: RegularUserPresenter,
    description: 'User which is a volunteer in relation with the organization',
  })
  user: RegularUserPresenter;

  @Expose()
  @ApiProperty({ description: 'Date when the volunteer became inactive' })
  archivedOn: Date;

  @Expose()
  @ApiProperty({ description: 'Admin who archived the volunteer' })
  archivedBy: IdAndNamePresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date when the volunteer was blocked' })
  blockedOn: Date;

  @Expose()
  @ApiProperty({ description: 'Admin who blocked the volunteer' })
  blockedBy: IdAndNamePresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
