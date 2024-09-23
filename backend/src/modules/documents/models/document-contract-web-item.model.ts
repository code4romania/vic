import { DocumentContractWebItemView } from '../entities/document-contract-web-item.entity';
import { DocumentContractStatus } from '../enums/contract-status.enum';

export interface IDocumentContractWebItemModel {
  documentId: string;
  documentNumber: string;
  documentStartDate: Date;
  documentEndDate: Date;
  documentFilePath: string;
  status: DocumentContractStatus;
  volunteerId: string;
  volunteerName: string;
  organizationId: string;
  createdByAdminId: string;
  createdByAdminName: string;
  rejectedById: string;
  rejectedByName: string;
  rejectionDate: Date;
  rejectionReason: string;
  createdOn: Date;
  updatedOn: Date;
}

export type FindOneDocumentContractWebItemOptions = {
  documentId: string;
  organizationId: string;
};

export const DocumentContractWebItemTransformer = {
  fromEntity: (
    entity: DocumentContractWebItemView,
  ): IDocumentContractWebItemModel => {
    return {
      ...entity,
    };
  },
};
