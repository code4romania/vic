import { ContractStatus } from '../enums/contract.status.enum';

export interface IContractListItem {
  id: string;
  name: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
}
