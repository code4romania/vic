import { ContractStatus } from '../enums/contract-status.enum';
import { DocumentType } from '../enums/document-type.enum';
import { IdName } from './id-name.interface';

export interface IContractListItem {
  id: string;
  contractNumber: string | null;
  volunteer: IdName;
  volunteerEmail?: string | null;
  status: ContractStatus;
  // #490: a contract or a certificate
  type: DocumentType;
  // #488: signed, and within a month of its end date
  expiringSoon: boolean;
  startDate: Date;
  // #486: no end date means the contract never expires
  endDate: Date | null;
  fileName: string;
  uri: string;
}

export interface IContract extends IContractListItem {
  createdBy: IdName;
  createdOn: Date;
}

export interface IUploadContractPayload {
  volunteerId: string;
  startDate: Date;
  endDate?: Date | null;
  contractNumber?: string;
  contract: File;
  type?: DocumentType;
}

// #490: "Generează adeverință"
export interface ICertificatePrefill {
  volunteerId: string;
  volunteerName: string;
  hours: number;
  since: string | null;
}

export interface IGenerateCertificatePayload {
  volunteerId: string;
  hours: number;
  purpose: string;
  registrationNumber: string;
  issueDate: Date;
}
