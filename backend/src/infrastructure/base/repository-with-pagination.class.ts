import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Between,
  FindManyOptions,
  FindOperator,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { format } from 'date-fns';
import { IBasePaginationFilterModel } from './base-pagination-filter.model';
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

export interface IPaginationConfig<T> {
  searchableColumns: string[];
  defaultSortBy: string;
  defaultOrderDirection: OrderDirection;
  selectColumns?: FindOptionsSelect<T>;
  relations: FindOptionsRelations<T>;
  rangeColumn?: string | [string, string];
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

  /**
   * @deprecated use paginateQuery instead
   * @param config
   * @param options
   * @param toModel
   * @returns
   */
  public async findManyPaginated<TModel>(
    config: IPaginationConfig<T>,
    options: { filters: FindOptionsWhere<T> } & IBasePaginationFilterModel,
    toModel: (entity: T) => TModel,
  ): Promise<Pagination<TModel>> {
    const {
      limit,
      page,
      search,
      orderBy,
      orderDirection,
      start,
      end,
      filters,
    } = options;

    // filters (and where)
    const orWhereQuery = [];
    let andWherQuery = filters || {};

    // handle range
    if (config.rangeColumn) {
      // Validate when both sides of the interval are provided by the user
      if (start && end) {
        // calculate range based on one single
        if (typeof config.rangeColumn === 'string') {
          andWherQuery = {
            ...andWherQuery,
            ...this.buildRangeQuery(config.rangeColumn, start, end),
          };
        }

        // calculate range based on 2 columns, if rangecolumn comes as an array
        if (typeof config.rangeColumn === 'object') {
          // build interval conditions
          const intervalIntersection = this.checkOneIntervalComprisesAnother(
            config.rangeColumn[0],
            config.rangeColumn[1],
            start,
            end,
          );

          andWherQuery = {
            ...andWherQuery,
            ...intervalIntersection,
          };
        }
      }
      // validate if only the left side of the interval is available
      else if (start) {
        // validate one range column
        if (typeof config.rangeColumn === 'string') {
          // get all results which have the range column value smaller than the the start value
          andWherQuery = {
            ...andWherQuery,
            ...this.buildRangeQuery(config.rangeColumn, start, end),
          };
        }

        // validate 2 range columns
        if (typeof config.rangeColumn === 'object') {
          // get all results which have the first range column (startDate) value smaller than the the start value
          andWherQuery = {
            ...andWherQuery,
            [config.rangeColumn[0]]: MoreThanOrEqual(
              format(start, DATE_CONSTANTS.YYYY_MM_DD),
            ),
          };
        }
      }
      // validate if only the right side of the interval is provided
      else if (end) {
        // validate one range column
        if (typeof config.rangeColumn === 'string') {
          // get all results which have the range column value bigger than the the start value
          andWherQuery = {
            ...andWherQuery,
            ...this.buildRangeQuery(config.rangeColumn, start, end),
          };
        }
        // validate 2 range columns
        if (typeof config.rangeColumn === 'object') {
          // get all results which have the second range column (endDate) value smaller than the the start value
          andWherQuery = {
            ...andWherQuery,
            [config.rangeColumn[1]]: LessThanOrEqual(
              format(end, DATE_CONSTANTS.YYYY_MM_DD),
            ),
          };
        }
      }
    }

    // search query
    if (search) {
      const where = config.searchableColumns.map((column: string) => ({
        ...andWherQuery,
        ...this.buildSearchQuery(column, search),
      }));
      orWhereQuery.push(...where);
    } else {
      if (Object.keys(andWherQuery).length > 0) orWhereQuery.push(andWherQuery);
    }

    // order conditions
    const orderOptions = this.buildOrderQuery(
      orderBy || config.defaultSortBy,
      orderDirection || config.defaultOrderDirection,
    );

    // full query
    const query: FindManyOptions<T> = {
      select: config.selectColumns || {},
      relations: config.relations,
      order: orderOptions,
      take: limit,
      skip: (page - 1) * limit,
      where: orWhereQuery.length > 0 ? orWhereQuery : {},
    };

    // [T[], totalItems]
    const response = await this.repository.findAndCount(query);

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

  private buildSearchQuery = (
    option: string,
    search: string,
  ): FindOptionsSelect<T> => {
    const optionValues = option.split('.');
    const query =
      optionValues.length === 1
        ? { [option]: ILike(`%${search}%`) }
        : {
            [optionValues[0]]: this.buildSearchQuery(
              optionValues.slice(1).join('.'),
              search,
            ),
          };

    return query as FindOptionsSelect<T>;
  };

  private buildRangeQuery = (
    option: string,
    start: Date,
    end: Date,
  ): FindOptionsSelect<T> => {
    const optionValues = option.split('.');
    const query =
      optionValues.length === 1
        ? { [option]: this.setRangeSelector(start, end) }
        : {
            [optionValues[0]]: this.buildRangeQuery(
              optionValues.slice(1).join('.'),
              start,
              end,
            ),
          };

    return query as FindOptionsSelect<T>;
  };

  private setRangeSelector(start?: Date, end?: Date): FindOperator<string> {
    if (start && end) {
      return this.betweenDates(start, end);
    }

    if (start) {
      return MoreThanOrEqual(format(start, DATE_CONSTANTS.YYYY_MM_DD));
    }

    if (end) {
      return LessThanOrEqual(format(end, DATE_CONSTANTS.YYYY_MM_DD));
    }
  }

  private buildOrderQuery = (
    orderBy: string,
    orderDirection: OrderDirection,
  ): FindOptionsOrder<T> => {
    const orderValues = orderBy.split('.');

    const query =
      orderValues.length === 1
        ? { [orderBy]: orderDirection }
        : {
            [orderValues[0]]: this.buildOrderQuery(
              orderValues.slice(1).join('.'),
              orderDirection,
            ),
          };

    return query as FindOptionsOrder<T>;
  };

  private betweenDates = (
    from: Date | string,
    to: Date | string,
  ): FindOperator<string> => {
    // format start date to start of day
    const startDate = typeof from === 'string' ? new Date(from) : from;
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    // format end date to end of day
    const endDate = typeof to === 'string' ? new Date(to) : to;
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    return Between(
      format(startDate, DATE_CONSTANTS.YYYY_MM_DD_HH_SS),
      format(endDate, DATE_CONSTANTS.YYYY_MM_DD_HH_SS),
    );
  };

  private checkOneIntervalComprisesAnother = <T>(
    startDateColumn: string,
    endDateColumn: string,
    from: Date | string,
    to: Date | string,
  ): { [key: string]: FindOperator<T> } => {
    // format start date to start of day
    const startDate = typeof from === 'string' ? new Date(from) : from;
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    // format end date to end of day
    const endDate = typeof to === 'string' ? new Date(to) : to;
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    const range = {
      [startDateColumn]: MoreThanOrEqual(
        format(startDate, DATE_CONSTANTS.YYYY_MM_DD_HH_SS),
      ),
      [endDateColumn]: LessThanOrEqual(
        format(endDate, DATE_CONSTANTS.YYYY_MM_DD_HH_SS),
      ),
    };

    return range as { [key: string]: FindOperator<T> };
  };
}
