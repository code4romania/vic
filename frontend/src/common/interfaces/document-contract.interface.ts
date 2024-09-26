import {
  DocumentContractStatusForFilter,
  DocumentContractStatus,
} from '../enums/document-contract-status.enum';
import { OrderDirection } from '../enums/order-direction.enum';

export interface IDocumentContract {
  documentId: string;
  documentNumber: string;
  documentFilePath?: string;
  documentStartDate: Date;
  documentEndDate: string;
  organizationId: string;
  organizationName: string;
  status: DocumentContractStatusForFilter;
  volunteerId: string;
  volunteerName: string;
}
export interface IGetDocumentsContractsParams {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: OrderDirection;
  volunteerId?: string;
  status?: DocumentContractStatusForFilter;
  documentStartDate?: string;
  documentEndDate?: string;
}

export interface IAddDocumentContractDTO {
  documentNumber: string;
  documentDate: string;
  documentStartDate: string;
  documentEndDate: string;
  volunteerId: string;
  documentTemplateId: string;
}

export interface IGetDocumentContractResponse {
  documentId: string;
  documentNumber: string;
  documentStartDate: string;
  documentEndDate: string;
  documentFilePath: string | null;
  status: DocumentContractStatus;
  volunteerId: string;
  volunteerName: string;
  organizationId: string;
  createdByAdminId: string;
  createdByAdminName: string;
  documentTemplateId: string;
  documentTemplateName: string;
  rejectedById: string | null;
  rejectedByName: string | null;
  rejectionDate: string | null;
  rejectionReason: string | null;
  createdOn: string;
  updatedOn: string;
}

export interface ISignDocumentContractBody {
  legalRepresentativeSignatureBase64: string;
}

export interface IRejectDocumentContractBody {
  rejectionReason: string;
}

export interface IDocumentContractsStatistics {
  pendingNgoRepresentativeSignature: number;
  pendingVolunteerSignature: number;
  activeContracts: number;
  soonToExpire: number;
}
