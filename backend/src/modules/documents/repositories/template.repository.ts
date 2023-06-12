import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';

import { TemplateEntity } from '../entities/template.entity';
import { ITemplateRepository } from '../interfaces/template-repository.interface';
import {
  CreateTemplateOptions,
  FindManyTemplatesOptions,
  FindTemplateOptions,
  ITemplateModel,
  TemplateTransformer,
} from '../models/template.model';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

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
    findOptions: FindManyTemplatesOptions,
  ): Promise<Pagination<ITemplateModel>> {
    const { orderBy, orderDirection, organizationId } = findOptions;

    // create query
    const query = this.templateRepository
      .createQueryBuilder('template')
      .select()
      .where('template.organizationId = :organizationId', {
        organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'name', 'template'),
        orderDirection || OrderDirection.DESC,
      );

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      TemplateTransformer.fromEntity,
    );
  }

  async find(findOptions: FindTemplateOptions): Promise<ITemplateModel> {
    const template = await this.templateRepository.findOne({
      where: findOptions,
    });

    return TemplateTransformer.fromEntity(template);
  }
}
