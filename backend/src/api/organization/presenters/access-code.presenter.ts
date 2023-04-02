import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IAccessCodeModel } from 'src/modules/organization/models/access-code.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';

export class AccessCodePresenter {
  constructor(accessCode: IAccessCodeModel) {
    this.id = accessCode.id;
    this.code = accessCode.code;
    this.startDate = accessCode.startDate;
    this.endDate = accessCode.endDate;
    this.usageCount = accessCode.usageCount;
    this.createdBy = accessCode.createdBy
      ? new IdAndNamePresenter<IAdminUserModel>(accessCode.createdBy)
      : null;
    this.createdOn = accessCode.createdOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the post',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The code',
    example: 'TRB123',
  })
  code: string;

  @Expose()
  @ApiProperty({ description: 'The start date of the code availability' })
  startDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The end date of the code availability',
    required: false,
  })
  endDate?: Date;

  @Expose()
  @ApiProperty({
    description: 'How many times the code was used to register by volunteers',
    required: false,
  })
  usageCount: number;

  @Expose()
  @ApiProperty({ description: 'The Admin User who created the code' })
  createdBy: IdAndNamePresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;
}
