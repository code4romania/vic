import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';

export class OrganizationProfilePresenter {
  constructor(organization: IOrganizationModel) {
    this.id = organization.id;
    this.name = organization.name;
    this.logo = organization.logo;
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
}
