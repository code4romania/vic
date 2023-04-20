import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IAccessRequestModel,
  IAccessRequestQA,
} from 'src/modules/access-request/model/access-request.model';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { RegularUserPresenter } from 'src/api/auth/presenters/user.presenter';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';

export class AccessRequestPresenter {
  constructor(accessRequest: IAccessRequestModel) {
    this.id = accessRequest.id;
    this.status = accessRequest.status;
    this.rejectionReason = accessRequest.rejectionReason;
    this.answers = accessRequest.answers;
    this.requestedBy = accessRequest.requestedBy
      ? new RegularUserPresenter(accessRequest.requestedBy)
      : null;
    this.updatedBy = accessRequest.updatedBy
      ? new IdAndNamePresenter<IAdminUserModel>(accessRequest.updatedBy)
      : null;
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
    example: [
      { question: 'De unde ai auzit de noi?', answer: 'Internet' },
      {
        question: 'Ce motiveaza inscrierea?',
        answer: 'Sunt un voluntar dedicat',
      },
    ],
  })
  answers: IAccessRequestQA[];

  @Expose()
  @ApiProperty({ description: 'The user who made the request.' })
  requestedBy: RegularUserPresenter;

  @Expose()
  @ApiProperty({ description: 'The user who made the request.' })
  updatedBy: IdAndNamePresenter<IAdminUserModel>;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
