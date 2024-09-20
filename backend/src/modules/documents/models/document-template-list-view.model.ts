import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import { DocumentTemplateListViewEntity } from '../entities/document-template-list-view.entity';

export interface IDocumentTemplateListViewModel {
  id: string;
  name: string;

  usageCount: number;
  lastUsage: Date | null;

  createdById: string;
  createdByName: string;

  createdOn: Date;
}

export type FindManyDocumentTemplateListViewOptions =
  IBasePaginationFilterModel & {
    organizationId: string;
  };

export class DocumentTemplateListViewTransformer {
  static fromEntity(
    entity: DocumentTemplateListViewEntity,
  ): IDocumentTemplateListViewModel {
    return {
      ...entity,
    };
  }
}
