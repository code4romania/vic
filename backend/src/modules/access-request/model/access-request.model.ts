import { OneOf } from 'src/common/helpers/typescript-extends';
import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import {
  FindRegularUserOptions,
  IRegularUserModel,
} from 'src/modules/user/models/regular-user.model';
import { FindOptionsWhere } from 'typeorm';
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

export type ApproveAccessRequestModel = Pick<IAccessRequestModel, 'id'> & {
  updatedById: string;
};

export type RejectAccessRequestModel = Pick<IAccessRequestModel, 'id'> & {
  updatedById: string;
  rejectionReason?: string;
};

export type UpdateAccessRequestModel = OneOf<
  [ApproveAccessRequestModel, RejectAccessRequestModel]
> &
  Pick<IAccessRequestModel, 'status'>;

export type FindAccessRequestOptions = Partial<
  Pick<IAccessRequestModel, 'id' | 'organizationId' | 'status'>
> & { requestedById?: string };

export type FindManyAccessRequestsOptions = Partial<
  Pick<IAccessRequestModel, 'organizationId' | 'status'> & {
    locationId: number;
  }
> &
  IBasePaginationFilterModel;

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
