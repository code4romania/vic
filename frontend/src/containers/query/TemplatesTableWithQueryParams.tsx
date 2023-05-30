/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import TemplatesTable from '../../components/TemplatesTable';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';

export type TemplatesTableProps = IHOCQueryProps<IPaginationQueryParams>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const TemplatesTableWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <TemplatesTable {...props} />;
      }}
    </QueryParams>
  );
};

export default TemplatesTableWithQueryParams;
