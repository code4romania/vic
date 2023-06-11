/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DateParam, QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ContractsTable from '../../components/ContractsTable';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';
import { ContractStatus } from '../../common/enums/contract-status.enum';

export interface ContractsTableQueryProps extends IPaginationQueryParams {
  volunteer?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
}

export type ContractsTableProps = IHOCQueryProps<ContractsTableQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const ContractsTableWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    volunteer: StringParam,
    search: StringParam,
    startDate: DateParam,
    endDate: DateParam,
    status: StringParam,
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
