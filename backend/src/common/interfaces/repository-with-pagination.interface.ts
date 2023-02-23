import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  IPaginationConfig,
  Pagination,
} from 'src/infrastructure/base/repository-with-pagination.class';

export interface IRepositoryWithPagination<T extends BaseEntity> {
  findManyPaginated<TModel>(
    config: IPaginationConfig<T>,
    options: IBasePaginationFilterModel,
    toModel: (entity: T) => TModel,
  ): Promise<Pagination<TModel>>;
}
