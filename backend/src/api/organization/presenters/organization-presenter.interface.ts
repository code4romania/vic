import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
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
    this.status = organization.status;
    this.validatedAt = organization.validatedAt;
    this.taxId = organization.taxId;
    this.website = organization.website;
    this.statuteUrl = organization.statuteUrl;
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
  @ApiProperty({ enum: OrganizationStatus })
  status: OrganizationStatus;

  @Expose()
  @ApiProperty({
    description:
      'When a super admin validated it; null shows the "awaiting validation" banner',
    nullable: true,
  })
  validatedAt: Date;

  @Expose()
  @ApiProperty({ description: 'CUI' })
  taxId: string;

  @Expose()
  @ApiProperty({ nullable: true })
  website: string;

  @Expose()
  @ApiProperty({
    description: 'A link to the statute PDF, valid for a day',
    nullable: true,
  })
  statuteUrl: string;
}
