import { IBaseModel } from 'src/common/interfaces/base.model';
import { ContractEntity } from '../entities/contract.entity';
import { ContractStatus } from '../enums/contract-status.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  IVolunteerModel,
  VolunteerModelTransformer,
} from 'src/modules/volunteer/model/volunteer.model';
import { ClientContractStatus } from '../enums/client-contract-status.enum';
import { ITemplateModel, TemplateTransformer } from './template.model';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';

export interface IContractModel extends IBaseModel {
  id: string;
  contractNumber: string;
  path: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  organizationId: string;
  templateId?: string;
  volunteerId: string;
  fileName: string;
  volunteer: IVolunteerModel;
  template?: ITemplateModel;
  createdByAdmin: IAdminUserModel;
  rejectedBy?: IAdminUserModel;
  approvedBy?: IAdminUserModel;
  rejectedOn?: Date;
  approvedOn?: Date;
  rejectionReason?: string;
}

export type CreateContractOptions = Pick<
  IContractModel,
  | 'contractNumber'
  | 'organizationId'
  | 'path'
  | 'startDate'
  | 'endDate'
  | 'templateId'
  | 'volunteerId'
> & { createdByAdminId: string };

export type FindManyContractOptions = IBasePaginationFilterModel &
  Partial<
    Pick<
      IContractModel,
      'organizationId' | 'startDate' | 'endDate' | 'volunteerId'
    > & {
      volunteerName?: string;
      status?: ClientContractStatus;
    }
  >;

export type FindContractOptions = Partial<
  Pick<IContractModel, 'id' | 'organizationId' | 'status'> & {
    statuses?: ContractStatus[];
  }
>;

export type UpdateContractOptions = Partial<
  Pick<IContractModel, 'path' | 'status'> & {
    approvedById?: string;
    approvedOn?: Date;
    rejectedById?: string;
    rejectedOn?: Date;
    rejectionReason?: string;
  }
>;

export class ContractTransformer {
  static fromEntity(entity: ContractEntity): IContractModel {
    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      contractNumber: entity.contractNumber,
      path: entity.path,
      organizationId: entity.organizationId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
      templateId: entity.templateId,
      volunteerId: entity.volunteerId,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      fileName:
        'Contract_' + entity.contractNumber + `.${entity.path.split('.')[1]}`,
      volunteer: VolunteerModelTransformer.fromEntity(entity.volunteer),
      template: TemplateTransformer.fromEntity(entity.template),
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),
    };
  }

  static toEntity(model: CreateContractOptions): ContractEntity {
    const entity = new ContractEntity();

    entity.contractNumber = model.contractNumber;
    entity.organizationId = model.organizationId;
    entity.path = model.path;
    entity.startDate = model.startDate;
    entity.endDate = model.endDate;
    entity.templateId = model.templateId;
    entity.volunteerId = model.volunteerId;
    entity.createdByAdminId = model.createdByAdminId;

    return entity;
  }
}
