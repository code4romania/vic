/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, ArrayParam } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Announcements from '../../pages/Announcements';

export interface AnnouncementsQueryProps extends IPaginationQueryParams {
  status?: string;
  search?: string;
  targets?: string[];
}

export type AnnouncementsProps = IHOCQueryProps<AnnouncementsQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({
  orderBy: 'name',
  orderDirection: OrderDirection.DESC,
});

// set defaults (if needed) for other specific filter params
const AnnouncementsWithQueryParams = () => {
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    status: StringParam,
    search: StringParam,
    targets: ArrayParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Announcements {...props} />;
      }}
    </QueryParams>
  );
};

export default AnnouncementsWithQueryParams;
