/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { DivisionType } from '../../common/enums/division-type.enum';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import DivisionTable from '../../components/DivisionTable';

export interface DivisionTableQueryProps extends IPaginationQueryParams {
  type?: string;
}

export type DivisionTableProps = IHOCQueryProps<DivisionTableQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({ orderBy: 'name' });

// set defaults (if needed) for other specific filter params
const DivisionTableWithQueryParams = ({ type }: { type: DivisionType }) => {
  const TypeParam = withDefault(StringParam, type);
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    type: TypeParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <DivisionTable {...props} type={type} />;
      }}
    </QueryParams>
  );
};

export default DivisionTableWithQueryParams;
