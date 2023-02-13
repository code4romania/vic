import { IBaseModel } from 'src/common/interfaces/base.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { AccessRequestEntity } from '../entities/access-request.entity';
import { AccessRequestStatus } from '../enums/access-request-status.enum';

export interface IAccessRequestModel extends IBaseModel {
  id: string;
  status: AccessRequestStatus;
  rejectionReason?: string;
  answers: IAccessRequestQA[];
  // Relations
  requestedBy: IRegularUserModel;
  updatedBy: IAdminUserModel;
  organizationId: string;
}

export interface IAccessRequestQA {
  question: string;
  answer: string;
}

export type CreateAccessRequestModel = Pick<
  IAccessRequestModel,
  'answers' | 'organizationId'
> & { requestedById: string };

export type UpdateAccessRequestModel = Pick<
  IAccessRequestModel,
  'id' | 'status' | 'rejectionReason'
> & { updatedById: string };

export type FindAccessRequestModel = Pick<IAccessRequestModel, 'id'>;

export class AccessRequestTransformer {
  static fromEntity(entity: AccessRequestEntity): IAccessRequestModel {
    return {
      id: entity.id,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      answers: entity.answers,
      requestedBy: entity.requestedBy,
      updatedBy: entity.updatedBy,
      organizationId: entity.organizationId,
      updatedOn: entity.updatedOn,
      createdOn: entity.createdOn,
    };
  }

  static toEntity(model: CreateAccessRequestModel): AccessRequestEntity {
    const entity = new AccessRequestEntity();
    entity.answers = model.answers;
    entity.requestedById = model.requestedById;
    entity.organizationId = model.organizationId;
    return entity;
  }
}
