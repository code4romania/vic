import { ContractStatus } from '../enums/contract-status.enum';

export interface IContractListItem {
  id: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  path: string;
  status: ContractStatus;
  contractFileName: string;
}
