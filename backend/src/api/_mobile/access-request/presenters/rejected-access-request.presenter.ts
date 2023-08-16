import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IAccessRequestModel } from 'src/modules/access-request/model/access-request.model';

export class MobileRejectedAccessRequestPresenter {
  constructor(accessRequest: IAccessRequestModel) {
    this.id = accessRequest.id;
    this.organizationLogo = accessRequest.organization.logo;
    this.organizationName = accessRequest.organization.name;
    this.createdOn = accessRequest.createdOn;
    this.rejectionReason = accessRequest.rejectionReason;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the access requesr',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'organization logo link',
  })
  organizationLogo: string;

  @Expose()
  @ApiProperty({
    description: 'OrganizationName',
    example: 'ONG Test',
  })
  organizationName: string;

  @Expose()
  @ApiProperty({
    description: 'Access request Date',
    example: '12.12.2022',
  })
  createdOn: Date;

  @Expose()
  @ApiProperty({
    description: 'Access request rejection reason',
    example: 'The reques was not filled properly',
  })
  rejectionReason?: string;
}
