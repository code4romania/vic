import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IOrganizationVolunteerModel } from 'src/modules/organization/models/organization-volunteer.models';

export class OrganizationVolunteerPresenter {
  constructor(organization: IOrganizationVolunteerModel) {
    this.id = organization.id;
    this.name = organization.name;
    this.logo = organization.logo;
    this.volunteerId = organization.volunteerId;
    this.volunteerProfileId = organization.volunteerProfileId;
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
    description: 'The logo of the Organization',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    description: 'The volunteer id for this organization',
  })
  volunteerId: string;

  @Expose()
  @ApiProperty({
    description: 'The volunteer profile id for this organization',
  })
  volunteerProfileId: string;
}
