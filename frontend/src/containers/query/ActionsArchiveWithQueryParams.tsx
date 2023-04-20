/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, DateParam } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ActionsArchive from '../../pages/ActionsArchive';

export interface ActionsArchiveQueryProps extends IPaginationQueryParams {
  search?: string;
  actionStartDate?: Date;
  actionEndDate?: Date;
  author?: string;
}

export type ActionsArchiveProps = IHOCQueryProps<ActionsArchiveQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({});

const ActionsArchiveWithQueryParams = () => {
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    search: StringParam,
    actionStartDate: DateParam,
    actionEndDate: DateParam,
    author: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <ActionsArchive {...props} />;
      }}
    </QueryParams>
  );
};

export default ActionsArchiveWithQueryParams;
