import { NumberParam, StringParam } from 'use-query-params';

export const PaginationConfig = {
  rowsPerPageOptions: [5, 10, 15, 20],
  defaultRowsPerPage: 10,
  defaultPage: 1,
};

export const DEFAULT_QUERY_PARAMS = {
  page: NumberParam,
  limit: NumberParam,
  orderBy: StringParam,
  orderDirection: StringParam,
};
