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
import { addDays } from 'date-fns';
import { bucharestDay } from 'src/common/helpers/bucharest-time';
import { DocumentType } from '../enums/document-type.enum';
import { sanitizeFileNamePart } from 'src/common/helpers/sanitize-file-name-part';

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
  endDate: Date | null;
  status: ContractStatus;
  type: DocumentType;
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
> & {
  createdByAdminId: string;
  status?: ContractStatus;
  type?: DocumentType;
};

export type FindManyContractOptions = IBasePaginationFilterModel &
  Partial<
    Pick<
      IContractModel,
      'organizationId' | 'startDate' | 'endDate' | 'volunteerId'
    > & {
      volunteerName?: string;
      status?: ClientContractStatus;
      type?: DocumentType;
      userId: string;
    }
  >;

export type FindContractOptions = Partial<
  Pick<
    IContractModel,
    | 'id'
    | 'organizationId'
    | 'status'
    | 'contractNumber'
    | 'volunteerId'
    | 'templateId'
    | 'type'
  >
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
      type: entity.type ?? DocumentType.CONTRACT,
      approvedOn: entity.approvedOn,
      rejectedOn: entity.rejectedOn,
      fileName: `${
        entity.type === DocumentType.CERTIFICATE ? 'Adeverinta' : 'Contract'
      }_${sanitizeFileNamePart(entity.contractNumber ?? entity.id.slice(0, 8))}.${
        entity.path.split('.').pop() || 'pdf'
      }`,
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
    entity.status = model.status ?? ContractStatus.ACTIVE;
    entity.type = model.type ?? DocumentType.CONTRACT;

    return entity;
  }
}

// #488: within a month of its end date a signed contract is tagged "Expiră în curând".
export const EXPIRING_SOON_DAYS = 30;

// A contract is valid through its whole last day in Bucharest (see contractStatusCondition)
const isPastEnd = (
  contract: Pick<IContractModel, 'endDate'>,
  now: Date,
): boolean =>
  !!contract.endDate &&
  bucharestDay(new Date(contract.endDate)) < bucharestDay(now);

export const mapContractStatusToClientContractStatus = (
  contract: Pick<IContractModel, 'status' | 'endDate'>,
  now: Date = new Date(),
): ClientContractStatus => {
  if (isPastEnd(contract, now)) return ClientContractStatus.EXPIRED;
  return contract.status === ContractStatus.ACTIVE
    ? ClientContractStatus.SIGNED
    : ClientContractStatus.PENDING;
};

export const isContractExpiringSoon = (
  contract: Pick<IContractModel, 'status' | 'endDate'>,
  now: Date = new Date(),
): boolean =>
  mapContractStatusToClientContractStatus(contract, now) ===
    ClientContractStatus.SIGNED &&
  !!contract.endDate &&
  bucharestDay(new Date(contract.endDate)) <=
    bucharestDay(addDays(now, EXPIRING_SOON_DAYS));
