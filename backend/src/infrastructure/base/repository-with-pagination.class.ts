import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { format } from 'date-fns';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { BaseEntity } from './base-entity';

export interface IPaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Pagination<T> {
  items: T[];
  meta: IPaginationMeta;
}

export abstract class RepositoryWithPagination<T extends BaseEntity>
  implements IRepositoryWithPagination<T>
{
  constructor(private readonly repository: Repository<T>) {}

  /**
   *  OBS 1: This method uses limit and offset instead of skip and take because these methods uses query based method for selection (https://github.com/nestjsx/nestjs-typeorm-paginate/issues/576#issuecomment-1102374870) which is more performant
   *  OBS 2: Using limit and offset requiers more attention when writing the query as using joins there will be situations when the data is duplicated and there will be wrong results (https://github.com/typeorm/typeorm/issues/4742#issuecomment-783857414)
   *  OBS 3: Using take and skip will add an additional distinctAlias with the entity id and your query will become the from case, this will make it impossible to orderBy any aggragate column (count, sum, avg) (https://github.com/typeorm/typeorm/issues/2912#issuecomment-442659018)
   *  OBS 4: When sorting by aggregate columns (sum, count) we should use the name of the aggragate column with double quotes without the entity prefix (https://github.com/typeorm/typeorm/issues/6561#issuecomment-863646482), there seems to be a bug in typeorm
   * 
   * Link to issues:
     https://github.com/typeorm/typeorm/issues/4742#issuecomment-783857414
     https://github.com/typeorm/typeorm/issues/747
     https://github.com/typeorm/typeorm/issues/6561
     https://github.com/typeorm/typeorm/issues/8605
   * 
   */
  public async paginateQuery<TModel>(
    query: SelectQueryBuilder<T>,
    limit: number,
    page: number,
    toModel: (entity: T) => TModel,
  ): Promise<Pagination<TModel>> {
    // [T[], totalItems]
    const response = await query
      .limit(limit) // take will add a distinct entity_id a the begining of the query which will interfeer with ordering bt agregate count column
      .offset((page - 1) * limit) // skip will add a distinct entity_id a the begining of the query which will interfeer with ordering bt agregate count column
      .getManyAndCount();

    // query items + the pagination meta
    return {
      items: response[0].map(toModel),
      meta: {
        itemCount: response[0].length,
        totalItems: response[1],
        itemsPerPage: limit,
        totalPages: Math.ceil(response[1] / limit),
        currentPage: page,
      },
    };
  }

  protected buildOrderByQuery = (orderBy: string, prefix: string): string => {
    // if order by is undefined skip
    if (!orderBy) return orderBy;

    // if orderBy contains field from relation entity leave it as is otherwise add entity prefix
    return orderBy.split('.').length > 1 ? orderBy : `${prefix}.${orderBy}`;
  };

  protected buildBracketSearchQuery(
    searchColumns: string[],
    search: string,
  ): Brackets {
    return new Brackets((qb) => {
      searchColumns.forEach((column) =>
        qb.orWhere(`${column} ILIKE :search`, {
          search: `%${search}%`,
        }),
      );
    });
  }

  protected addRangeConditionToQuery(
    query: SelectQueryBuilder<T>,
    column: string,
    start: Date,
    end?: Date,
  ): SelectQueryBuilder<T> {
    const prefix = column.split('.').join('');
    if (end) {
      query.andWhere(`${column} BETWEEN :${prefix}Start AND :${prefix}End`, {
        [`${prefix}Start`]: format(start, DATE_CONSTANTS.YYYY_MM_DD),
        [`${prefix}End`]: format(end, DATE_CONSTANTS.YYYY_MM_DD),
      });
    } else {
      query.andWhere(`${column} >= :${prefix}Start`, {
        [`${prefix}Start`]: format(start, DATE_CONSTANTS.YYYY_MM_DD),
      });
    }

    return query;
  }
}
