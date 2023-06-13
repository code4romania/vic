import { IBaseModel } from 'src/common/interfaces/base.model';
import { ContractEntity } from '../entities/contract.entity';
import { ContractStatus } from '../enums/contract-status.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';

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
>;

export type FindManyContractOptions = IBasePaginationFilterModel &
  Pick<IContractModel, 'organizationId'>;

export type FindContractOptions = Partial<
  Pick<IContractModel, 'id' | 'organizationId'>
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

    return entity;
  }
}
