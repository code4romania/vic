import { Injectable } from '@nestjs/common';
import { DocumentTemplateListViewEntity } from '../entities/document-template-list-view.entity';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentTemplateListViewTransformer,
  FindManyDocumentTemplateListViewOptions,
  IDocumentTemplateListViewModel,
} from '../models/document-template-list-view.model';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

@Injectable()
export class DocumentTemplateListViewRepository extends RepositoryWithPagination<DocumentTemplateListViewEntity> {
  constructor(
    @InjectRepository(DocumentTemplateListViewEntity)
    private readonly documentTemplateListViewRepository: Repository<DocumentTemplateListViewEntity>,
  ) {
    super(documentTemplateListViewRepository);
  }

  async findMany(
    findOptions: FindManyDocumentTemplateListViewOptions,
  ): Promise<Pagination<IDocumentTemplateListViewModel>> {
    const {
      orderBy,
      orderDirection,
      search,
      limit,
      page,

      organizationId,
    } = findOptions;

    const query = this.documentTemplateListViewRepository
      .createQueryBuilder('documentTemplateListView')
      .where('documentTemplateListView.organizationId = :organizationId', {
        organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(
          orderBy || 'createdOn',
          'documentTemplateListView',
        ),
        orderDirection || OrderDirection.ASC,
      );

    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(['documentContractListView.name'], search),
      );
    }

    return this.paginateQuery(
      query,
      limit,
      page,
      DocumentTemplateListViewTransformer.fromEntity,
    );
  }
}
