import { ContractStatus } from '../enums/contract-status.enum';
import { IContractListItem } from './contract-list-item.interface';

export interface IContract extends Omit<IContractListItem, 'status'> {
  status: ContractStatus;
  contractFileName: string;
  rejectionReason?: string;
}
