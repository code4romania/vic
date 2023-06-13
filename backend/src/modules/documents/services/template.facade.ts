import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

import { TemplateRepositoryService } from '../repositories/template.repository';
import {
  CreateTemplateOptions,
  FindManyTemplatesOptions,
  FindTemplateOptions,
  ITemplateModel,
  UpdateTemplateOptions,
} from '../models/template.model';

@Injectable()
export class TemplateFacade {
  constructor(private readonly templateRepository: TemplateRepositoryService) {}

  public async findMany(
    findOptions: FindManyTemplatesOptions,
  ): Promise<Pagination<ITemplateModel>> {
    return this.templateRepository.findMany(findOptions);
  }

  public async create(
    newTemplate: CreateTemplateOptions,
  ): Promise<ITemplateModel> {
    return this.templateRepository.create(newTemplate);
  }

  public async findOne(
    findOptions: FindTemplateOptions,
  ): Promise<ITemplateModel> {
    return this.templateRepository.find(findOptions);
  }

  public async update(
    id: string,
    updatedTemplate: UpdateTemplateOptions,
  ): Promise<ITemplateModel> {
    return this.templateRepository.update(id, updatedTemplate);
  }

  public async delete(id: string): Promise<string> {
    return this.templateRepository.delete(id);
  }
}
