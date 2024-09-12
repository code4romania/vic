import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { DocumentContractListViewEntity } from '../entities/document-contract-list-view.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  DocumentContractListViewTransformer,
  FindManyDocumentContractListViewOptions,
  IDocumentContractListViewModel,
} from '../models/document-contract-list-view.model';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

@Injectable()
export class DocumentContractListViewRepository extends RepositoryWithPagination<DocumentContractListViewEntity> {
  constructor(
    @InjectRepository(DocumentContractListViewEntity)
    private readonly documentContractListViewRepository: Repository<DocumentContractListViewEntity>,
  ) {
    super(documentContractListViewRepository);
  }

  async findMany(
    findOptions: FindManyDocumentContractListViewOptions,
  ): Promise<Pagination<IDocumentContractListViewModel>> {
    const {
      orderBy,
      orderDirection,
      search,
      limit,
      page,

      organizationId,
      volunteerId,
      status,
    } = findOptions;

    const query = this.documentContractListViewRepository
      .createQueryBuilder('documentContractListView')
      .where('documentContractListView.organizationId = :organizationId', {
        organizationId,
      })
      .orderBy(
        this.buildOrderByQuery(
          orderBy || 'documentNumber',
          'documentContractListView',
        ),
        orderDirection || OrderDirection.ASC,
      );

    if (volunteerId) {
      query.andWhere('documentContractListView.volunteerId = :volunteerId', {
        volunteerId,
      });
    }

    if (status) {
      query.andWhere('documentContractListView.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['documentContractListView.documentNumber', 'user.name'],
          search,
        ),
      );
    }

    return this.paginateQuery(
      query,
      limit,
      page,
      DocumentContractListViewTransformer.fromEntity,
    );
  }
}
