import { ContractStatus } from '../enums/contract-status.enum';
import { IdName } from './id-name.interface';

export interface IContractListItem {
  id: string;
  contractNumber: string;
  volunteer: IdName;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  fileName: string;
  uri: string;
}

export interface IContract extends IContractListItem {
  template: IdName;
  createdBy: IdName;
  createdOn: Date;
  approvedOn?: Date;
  rejectedBy?: { id: string; name: string };
  rejectedOn?: Date;
  rejectionReason?: string;
}
