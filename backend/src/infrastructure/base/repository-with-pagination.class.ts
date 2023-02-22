import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Between,
  FindManyOptions,
  FindOperator,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { format } from 'date-fns';
import { IBasePaginationFilterModel } from './base-pagination-filter.model';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';

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

export abstract class RepositoryWithPagination<T>
  implements IRepositoryWithPagination<T>
{
  constructor(private readonly repository: Repository<T>) {}

  public async findManyPaginated<
    TModel,
    TFindOptions extends IBasePaginationFilterModel,
  >(
    config: IPaginationConfig<T>,
    options: TFindOptions,
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
      ...filters
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
            [config.rangeColumn]: this.betweenDates(start, end),
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
            [config.rangeColumn]: MoreThanOrEqual(
              format(start, DATE_CONSTANTS.YYYY_MM_DD),
            ),
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
            [config.rangeColumn]: LessThanOrEqual(
              format(end, DATE_CONSTANTS.YYYY_MM_DD),
            ),
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

  private checkOneIntervalComprisesAnother = (
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
