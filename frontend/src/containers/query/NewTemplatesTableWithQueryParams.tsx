/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getPaginationQueryParams } from '../../common/constants/pagination';
import { DateParam, NumberParam, QueryParams, StringParam } from 'use-query-params';
import NewTemplatesTable from '../../components/NewTemplatesTable';

const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

export const TemplatesTableWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    name: StringParam,
    uses: NumberParam,
    lastUseDate: DateParam,
    createdBy: StringParam,
    createdAt: DateParam,
  };
  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <NewTemplatesTable {...props} />;
      }}
    </QueryParams>
  );
};
