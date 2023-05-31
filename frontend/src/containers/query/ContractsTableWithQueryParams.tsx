/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ContractsTable from '../../components/ContractsTable';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';

export type ContractsTableProps = IHOCQueryProps<IPaginationQueryParams>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const ContractsTableWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <ContractsTable {...props} />;
      }}
    </QueryParams>
  );
};

export default ContractsTableWithQueryParams;
