import { ClientContractStatus } from '../enums/client-contract-status.enum';

export interface IContractListItem {
  id: string;
  contractNumber: string | null;
  startDate: string;
  // #486: no end date means the contract never expires
  endDate: string | null;
  path: string;
  status: ClientContractStatus;
  // #488: signed, and within a month of its end date
  expiringSoon: boolean;
  contractFileName: string;
}
