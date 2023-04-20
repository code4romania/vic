/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import AccessCodes from '../../pages/AccesCodes';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';

export type AccessCodesProps = IHOCQueryProps<IPaginationQueryParams>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const AccessCodesWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <AccessCodes {...props} />;
      }}
    </QueryParams>
  );
};

export default AccessCodesWithQueryParams;
