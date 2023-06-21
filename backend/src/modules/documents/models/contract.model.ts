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
import { compareAsc } from 'date-fns';

export interface IContractDownloadModel {
  'Numar contract': string;
  Voluntar: string;
  Status: string;
  'Data inceput': Date;
  'Data final': Date;
}

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
  Pick<
    IContractModel,
    'id' | 'organizationId' | 'status' | 'contractNumber' | 'volunteerId'
  > & {
    statuses?: ContractStatus[];
    startDate?: Date;
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
      approvedOn: entity.approvedOn,
      rejectedOn: entity.rejectedOn,
      fileName:
        'Contract_' + entity.contractNumber + `.${entity.path.split('.')[1]}`,
      volunteer: VolunteerModelTransformer.fromEntity(entity.volunteer),
      template: TemplateTransformer.fromEntity(entity.template),
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),
      approvedBy: AdminUserTransformer.fromEntity(entity.createdByAdmin),
      rejectedBy: AdminUserTransformer.fromEntity(entity.createdByAdmin),
      rejectionReason: entity.rejectionReason,
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

export const mapContractStatusToClientContractStatus = (
  contract: IContractModel,
): ClientContractStatus => {
  if (contract.status === ContractStatus.APPROVED) {
    // not started
    if (compareAsc(contract.startDate, new Date()) > 0) {
      return ClientContractStatus.NOT_STARTED;
    }

    // active
    if (
      compareAsc(contract.startDate, new Date()) <= 0 &&
      compareAsc(contract.endDate, new Date()) > 0
    ) {
      return ClientContractStatus.ACTIVE;
    }

    // closed
    if (compareAsc(contract.endDate, new Date()) > 0) {
      return ClientContractStatus.CLOSED;
    }
  }

  if (contract.status === ContractStatus.PENDING_ADMIN) {
    return ClientContractStatus.PENDING_ADMIN;
  }

  if (contract.status === ContractStatus.PENDING_VOLUNTEER) {
    return ClientContractStatus.PENDING_VOLUNTEER;
  }

  if (contract.status === ContractStatus.REJECTED) {
    return ClientContractStatus.REJECTED;
  }
};
