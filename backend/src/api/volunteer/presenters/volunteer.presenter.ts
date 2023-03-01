import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { VolunteerProfilePresenter } from './volunteer-profile.presenter';
import { UserPresenter } from 'src/api/_mobile/user/presenters/user-basic.presenter';
import { RegularUserPresenter } from 'src/api/auth/presenters/user.presenter';

export class VolunteerPresenter {
  constructor(volunteer: IVolunteerModel) {
    this.id = volunteer.id;
    this.status = volunteer.status;

    this.archivedOn = volunteer.archivedOn;
    this.archivedBy = volunteer.archivedBy
      ? new UserPresenter(volunteer.archivedBy)
      : null;

    this.blockedOn = volunteer.blockedOn;
    this.blockedBy = volunteer.blockedBy
      ? new UserPresenter(volunteer.blockedBy)
      : null;

    this.profile = volunteer.volunteerProfile
      ? new VolunteerProfilePresenter(volunteer.volunteerProfile)
      : null;
    this.organizationId = volunteer.organization.id;
    this.user = new RegularUserPresenter(volunteer.user);

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
  @ApiProperty({ description: 'The uuid of the organization' })
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: 'User which is a volunteer in relation with the organization',
  })
  user: UserPresenter<IRegularUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date when the volunteer was archived' })
  archivedOn: Date;

  @Expose()
  @ApiProperty({ description: 'Admin who archived the volunteer' })
  archivedBy: UserPresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date when the volunteer was blocked' })
  blockedOn: Date;

  @Expose()
  @ApiProperty({ description: 'Admin who blocked the volunteer' })
  blockedBy: UserPresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
