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
  TemplateTransformer,
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
    const template = await this.templateRepository.save(
      TemplateTransformer.toEntity(newTemplate),
    );

    return this.find({ id: template.id });
  }

  async findMany(
    findOptions: IBasePaginationFilterModel,
  ): Promise<Pagination<ITemplateModel>> {
    throw new Error('Method not implemented.');
  }

  async find(findOptions: { id: string }): Promise<ITemplateModel> {
    const template = await this.templateRepository.findOne({
      where: findOptions,
    });

    return TemplateTransformer.fromEntity(template);
  }
}
