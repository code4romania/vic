import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PendingOrganization } from 'src/usecases/organization/list-pending-validation.usecase';

export class PendingOrganizationAdminPresenter {
  constructor(admin: {
    id: string;
    name: string;
    email: string;
    phone: string;
  }) {
    this.id = admin.id;
    this.name = admin.name;
    this.email = admin.email;
    this.phone = admin.phone;
  }

  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() email: string;
  @Expose() @ApiProperty() phone: string;
}

// The super admin's review page: everything the NGO sent; the CUI is what gets checked.
export class PendingOrganizationPresenter {
  constructor(organization: PendingOrganization) {
    this.id = organization.id;
    this.name = organization.name;
    this.taxId = organization.taxId;
    this.email = organization.email;
    this.phone = organization.phone;
    this.address = organization.address;
    this.description = organization.description;
    this.website = organization.website;
    this.logo = organization.logo;
    this.registeredOn = organization.createdOn;
    this.firstAdmin = organization.firstAdmin
      ? new PendingOrganizationAdminPresenter(organization.firstAdmin)
      : null;
  }

  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty({ description: 'CUI' }) taxId: string;
  @Expose() @ApiProperty() email: string;
  @Expose() @ApiProperty() phone: string;
  @Expose() @ApiProperty({ nullable: true }) address: string;
  @Expose() @ApiProperty({ nullable: true }) description: string;
  @Expose() @ApiProperty({ nullable: true }) website: string;
  @Expose() @ApiProperty({ nullable: true }) logo: string;

  @Expose() @ApiProperty() registeredOn: Date;

  @Expose()
  @ApiProperty({ type: PendingOrganizationAdminPresenter })
  firstAdmin: PendingOrganizationAdminPresenter;
}
