import { Injectable } from '@nestjs/common';
import { DocumentTemplateRepositoryService } from '../repositories/document-template.repository';
import {
  CreateDocumentTemplateOptions,
  DeleteOneDocumentTemplateOptions,
  FindOneDocumentTemplateOptions,
  IDocumentTemplateModel,
} from '../models/document-template.model';
import { DocumentTemplateListViewRepository } from '../repositories/document-template-list-view.repository';
import {
  FindManyDocumentTemplateListViewOptions,
  IDocumentTemplateListViewModel,
} from '../models/document-template-list-view.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

@Injectable()
export class DocumentTemplateFacade {
  constructor(
    private readonly documentTemplateRepository: DocumentTemplateRepositoryService,
    private readonly documentTemplateListViewRepository: DocumentTemplateListViewRepository,
  ) {}

  async create(
    newDocumentTemplate: CreateDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel> {
    return this.documentTemplateRepository.create(newDocumentTemplate);
  }

  async findOne(
    findOptions: FindOneDocumentTemplateOptions,
  ): Promise<IDocumentTemplateModel> {
    return this.documentTemplateRepository.findOne(findOptions);
  }

  async findMany(
    findOptions: FindManyDocumentTemplateListViewOptions,
  ): Promise<Pagination<IDocumentTemplateListViewModel>> {
    return this.documentTemplateListViewRepository.findMany(findOptions);
  }

  async delete(options: DeleteOneDocumentTemplateOptions): Promise<string> {
    return this.documentTemplateRepository.delete(options);
  }
}
