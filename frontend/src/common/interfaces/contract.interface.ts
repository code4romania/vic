import { ContractStatus } from '../enums/contract-status.enum';
import { IdName } from './id-name.interface';

export interface IContractListItem {
  id: string;
  contractNumber: string;
  volunteer: IdName;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
}

export interface IContract {
  id: string;
  number: number;
  volunteer: { id: string; name: string };
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  signed?: string;
  template: { id: string; name: string };
  generatedBy: { id: string; name: string };
  generatedOn: Date;
  approvedOn?: Date;
  rejectedBy?: { id: string; name: string };
  rejectedOn?: Date;
  rejectionReason?: string;
}
