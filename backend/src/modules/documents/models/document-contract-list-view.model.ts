import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  DocumentContractStatus,
  DocumentContractStatusForDTO,
} from '../enums/contract-status.enum';
import { DocumentContractListViewEntity } from '../entities/document-contract-list-view.entity';

export interface IDocumentContractListViewModel {
  documentId: string;
  documentNumber: string;
  documentStartDate: Date;
  documentEndDate: Date;
  documentFilePath: string;
  status: DocumentContractStatus;
  volunteerId: string;
  volunteerName: string;
  organizationId: string;
  organizationName: string;
}

export type FindOneDocumentContractListViewOptions = {
  documentId: string;
  volunteerId: string;
};

export type FindManyDocumentContractListViewPaginatedOptions =
  IBasePaginationFilterModel & {
    organizationId: string;
    volunteerId?: string;
    status?: DocumentContractStatusForDTO;
    documentStartDate?: Date;
    documentEndDate?: Date;
  };

export class DocumentContractListViewTransformer {
  static fromEntity(
    entity: DocumentContractListViewEntity,
  ): IDocumentContractListViewModel {
    return {
      ...entity,
    };
  }
}
