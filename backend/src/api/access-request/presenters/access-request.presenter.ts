import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IAccessRequestModel,
  IAccessRequestQA,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

export class AccessRequestPresenter {
  constructor(accessRequest: IAccessRequestModel) {
    this.id = accessRequest.id;
    this.status = accessRequest.status;
    this.rejectionReason = accessRequest.rejectionReason;
    this.answers = accessRequest.answers;
    this.requestedBy = accessRequest.requestedBy;
    this.updatedBy = accessRequest.updatedBy
      ? {
          id: accessRequest.updatedBy.id,
          name: accessRequest.updatedBy.name,
        }
      : undefined;
    this.createdOn = accessRequest.createdOn;
    this.updatedOn = accessRequest.updatedOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Access Request',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The status',
    enum: AccessRequestStatus,
    examples: Object.values(AccessRequestStatus),
  })
  status: AccessRequestStatus;

  @Expose()
  @ApiProperty({ description: 'The reason for the rejection.' })
  rejectionReason?: string;

  @Expose()
  @ApiProperty({
    description: 'Questions and answers of the user for the current request.',
    required: false,
  })
  answers: IAccessRequestQA[];

  @Expose()
  @ApiProperty({ description: 'The user who made the request.' })
  requestedBy: IRegularUserModel;

  @Expose()
  @ApiProperty({ description: 'The user who made the request.' })
  updatedBy: Pick<IAdminUserModel, 'id' | 'name'>;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
