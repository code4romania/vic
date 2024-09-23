import { IBaseModel } from 'src/common/interfaces/base.model';
import { DocumentTemplateEntity } from '../entities/document-template.entity';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';

export interface IDocumentTemplateOrganizationData {
  officialName: string;
  registeredOffice: string; // Sediu social
  CUI: string;
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
}

export interface IDocumentTemplateModel extends IBaseModel {
  id: string;
  name: string;
  organizationData: IDocumentTemplateOrganizationData;
  documentTerms: string;
  organizationId: string;

  // Relations
  createdByAdmin: IAdminUserModel;
}

export type CreateDocumentTemplateOptions = Omit<
  IDocumentTemplateModel,
  'id' | 'createdOn' | 'updatedOn' | 'createdByAdmin'
> & { createdByAdminId: string };

export type FindOneDocumentTemplateOptions = Partial<
  Pick<IDocumentTemplateModel, 'id' | 'organizationId'>
>;

export type DeleteOneDocumentTemplateOptions = {
  id: string;
  organizationId: string;
};

export type UpdateDocumentTemplateOptions = {
  id: string;
  name: string;
  organizationData: IDocumentTemplateOrganizationData;
  documentTerms: string;
};

export class DocumentTemplateTransformer {
  static fromEntity(entity: DocumentTemplateEntity): IDocumentTemplateModel {
    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      name: entity.name,
      organizationData:
        entity.organizationData as IDocumentTemplateOrganizationData,
      documentTerms: entity.documentTerms,
      organizationId: entity.organizationId,
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }

  static toEntity(
    model: CreateDocumentTemplateOptions,
  ): DocumentTemplateEntity {
    const entity = new DocumentTemplateEntity();

    entity.name = model.name;
    entity.organizationData = model.organizationData;
    entity.documentTerms = model.documentTerms;
    entity.organizationId = model.organizationId;
    entity.createdByAdminId = model.createdByAdminId;

    return entity;
  }
}
