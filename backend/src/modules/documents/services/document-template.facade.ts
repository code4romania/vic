import { Injectable } from '@nestjs/common';
import { DocumentTemplateRepositoryService } from '../repositories/document-template.repository';
import {
  CreateDocumentTemplateOptions,
  FindOneDocumentTemplateOptions,
  IDocumentTemplateModel,
} from '../models/document-template.model';

@Injectable()
export class DocumentTemplateFacade {
  constructor(
    private readonly documentTemplateRepository: DocumentTemplateRepositoryService,
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
}
