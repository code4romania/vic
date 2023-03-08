import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { SelectQueryBuilder } from 'typeorm';

export interface IRepositoryWithPagination<T extends BaseEntity> {
  paginateQuery<TModel>(
    query: SelectQueryBuilder<T>,
    limit: number,
    page: number,
    toModel: (entity: T) => TModel,
  ): Promise<Pagination<TModel>>;
}
