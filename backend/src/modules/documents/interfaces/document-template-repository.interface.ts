import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import {
  CreateDocumentTemplateOptions,
  FindOneDocumentTemplateOptions,
  IDocumentTemplateModel,
} from '../models/document-template.model';
import { DocumentTemplateEntity } from '../entities/document-template.entity';

export interface IDocumentTemplateRepository
  extends IRepositoryWithPagination<DocumentTemplateEntity> {
  create(
    newDocumentTemplate: CreateDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel>;
  findOne(
    findOptions: FindOneDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel>;
}
