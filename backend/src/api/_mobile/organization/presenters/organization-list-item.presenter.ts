import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';

export class OrganizationListItemPresenter {
  constructor(organization: IOrganizationModel) {
    this.id = organization.id;
    this.name = organization.name;
    this.logo = organization.logo;
    this.numberOfVolunteers = 0;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the organization',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The organization name',
    example: 'Organization Name',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The organization logo',
  })
  logo?: string;

  @Expose()
  @ApiProperty({
    description: 'The number of active volunteers in organization',
    example: '10000',
  })
  numberOfVolunteers: number;
}
