import { ClientContractStatus } from '../enums/client-contract-status.enum';

export interface IContractListItem {
  id: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  path: string;
  status: ClientContractStatus;
  contractFileName: string;
}
