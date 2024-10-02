import { DocumentContractItemView } from '../entities/document-contract-web-item.entity';
import { DocumentContractComputedStatuses } from '../enums/contract-status.enum';

export interface IDocumentContractItemModel {
  documentId: string;
  documentNumber: string;
  documentStartDate: Date;
  documentEndDate: Date;
  documentFilePath: string;
  status: DocumentContractComputedStatuses;
  volunteerId: string;
  volunteerName: string;
  organizationId: string;
  createdByAdminId: string;
  createdByAdminName: string;
  documentTemplateId: string;
  documentTemplateName: string;
  organizationName: string;
  rejectedById: string;
  rejectedByName: string;
  rejectionDate: Date;
  rejectionReason: string;
  createdOn: Date;
  updatedOn: Date;
}

export type FindOneDocumentContractItemOptions = {
  documentId: string;
  organizationId: string;
  volunteerId?: string;
};

export const DocumentContractItemTransformer = {
  fromEntity: (
    entity: DocumentContractItemView,
  ): IDocumentContractItemModel => {
    if (!entity) {
      return null;
    }
    return {
      ...entity,
    };
  },
};
