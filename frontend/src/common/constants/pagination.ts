import { NumberParam, StringParam, withDefault } from 'use-query-params';
import { OrderDirection } from '../enums/order-direction.enum';

export const PaginationConfig = {
  rowsPerPageOptions: [5, 10, 15, 20],
  defaultRowsPerPage: 10,
  defaultPage: 1,
};

export interface IPaginationQueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: string;
}

export const getPaginationQueryParams = (defaults?: IPaginationQueryParams) => {
  const pageParam = withDefault(NumberParam, defaults?.page || PaginationConfig.defaultPage);
  const limitParam = withDefault(
    NumberParam,
    defaults?.limit || PaginationConfig.defaultRowsPerPage,
  );
  const orderByParam = withDefault(StringParam, defaults?.orderBy);
  const orderDirectionParam = withDefault(
    StringParam,
    defaults?.orderDirection || OrderDirection.ASC,
  );

  return {
    page: pageParam,
    limit: limitParam,
    orderBy: orderByParam,
    orderDirection: orderDirectionParam,
  };
};
