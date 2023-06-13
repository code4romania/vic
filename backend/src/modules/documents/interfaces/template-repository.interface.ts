import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { TemplateEntity } from '../entities/template.entity';
import {
  CreateTemplateOptions,
  FindManyTemplatesOptions,
  FindTemplateOptions,
  ITemplateModel,
  UpdateTemplateOptions,
} from '../models/template.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';

export interface ITemplateRepository
  extends IRepositoryWithPagination<TemplateEntity> {
  create(newTemplate: CreateTemplateOptions): Promise<ITemplateModel>;
  findMany(
    findOptions: FindManyTemplatesOptions,
  ): Promise<Pagination<ITemplateModel>>;
  findAll(findOptios: FindTemplateOptions): Promise<ITemplateModel[]>;
  find(findOptions: FindTemplateOptions): Promise<ITemplateModel>;
  update(
    id: string,
    updatedTemplate: UpdateTemplateOptions,
  ): Promise<ITemplateModel>;
  delete(id: string): Promise<string>;
}
