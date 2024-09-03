import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';

export class OrganizationPresenter {
  constructor(organization: IOrganizationModel) {
    this.id = organization.id;
    this.name = organization.name;
    this.email = organization.email;
    this.phone = organization.phone;
    this.address = organization.address;
    this.activityArea = organization.activityArea;
    this.logo = organization.logo;
    this.description = organization.description;
    this.cui = organization.cui;
    this.legalReprezentativeFullName = organization.legalReprezentativeFullName;
    this.legalReprezentativeRole = organization.legalReprezentativeRole;
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
    description: 'CUI Organization',
  })
  cui: string;

  @Expose()
  @ApiProperty({
    description: 'The legal representative full name of the Organization',
  })
  legalReprezentativeFullName: string;

  @Expose()
  @ApiProperty({
    description: 'The legal representative role of the Organization',
  })
  legalReprezentativeRole: string;
}
