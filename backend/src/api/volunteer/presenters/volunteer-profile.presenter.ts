import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IVolunteerProfileModel } from 'src/modules/volunteer/model/volunteer-profile.model';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';

export class VolunteerProfilePresenter {
  constructor(volunteer: IVolunteerProfileModel) {
    this.email = volunteer.email;
    this.activeSince = volunteer.activeSince;

    this.branch = volunteer.branch
      ? new OrganizationStructureListItemPresenter(volunteer.branch)
      : null;
    this.department = volunteer.department
      ? new OrganizationStructureListItemPresenter(volunteer.department)
      : null;
    this.role = volunteer.role
      ? new OrganizationStructureListItemPresenter(volunteer.role)
      : null;
  }

  @Expose()
  @ApiProperty({ description: 'The email of the volunteer' })
  email: string;

  @Expose()
  @ApiProperty({
    description:
      'Date since the volunteer is working with the organization (not the application join time).',
  })
  activeSince: Date;

  @Expose()
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  branch: OrganizationStructureListItemPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  department: OrganizationStructureListItemPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  role: OrganizationStructureListItemPresenter;
}
