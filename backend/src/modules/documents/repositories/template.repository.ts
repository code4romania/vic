import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';

import { TemplateEntity } from '../entities/template.entity';
import { ITemplateRepository } from '../interfaces/template-repository.interface';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  CreateTemplateOptions,
  ITemplateModel,
} from '../models/template.model';

@Injectable()
export class TemplateRepositoryService
  extends RepositoryWithPagination<TemplateEntity>
  implements ITemplateRepository
{
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepository: Repository<TemplateEntity>,
  ) {
    super(templateRepository);
  }

  async create(newTemplate: CreateTemplateOptions): Promise<ITemplateModel> {
    throw new Error('Method not implemented.');
  }

  async findMany(
    findOptions: IBasePaginationFilterModel,
  ): Promise<Pagination<ITemplateModel>> {
    throw new Error('Method not implemented.');
  }
}
