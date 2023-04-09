/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, DateParam, ArrayParam, withDefault } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { RequestStatus } from '../../common/enums/request-status.enum';
import AccessRequestTable from '../../components/AccessRequestTable';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { UseQueryResult } from 'react-query';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { ACCESS_REQUEST_ERRORS } from '../../common/errors/entities/access-request.errors';

export interface AccessRequestTableQueryProps extends IPaginationQueryParams {
  requestStatus?: RequestStatus;
  search?: string;
  location?: string[];
  createdOnStart?: Date;
  createdOnEnd?: Date;
  rejectedOnStart?: Date;
  rejectedOnEnd?: Date;
}

export type AccessRequestsTableProps = IHOCQueryProps<AccessRequestTableQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

// set defaults (if needed) for other specific filter params
const AccessRequestTableWithQueryParams = ({
  status,
  useAccessRequests,
}: {
  useAccessRequests?: (
    rowsPerPage: number,
    page: number,
    orderByColumn?: string,
    orderDirection?: OrderDirection,
    search?: string,
    createdOnStart?: Date,
    createdOnEnd?: Date,
    city?: string,
    county?: string,
    rejectedOnStart?: Date,
    rejectedOnEnd?: Date,
  ) => UseQueryResult<
    IPaginatedEntity<IAccessRequest>,
    AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>
  >;
  status?: RequestStatus;
}) => {
  // set request status default
  const RequestStatusParam = withDefault(StringParam, RequestStatus.PENDING);
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    requestStatus: RequestStatusParam,
    search: StringParam,
    location: ArrayParam,
    createdOnStart: DateParam,
    createdOnEnd: DateParam,
    rejectedOnStart: DateParam,
    rejectedOnEnd: DateParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return (
          <AccessRequestTable {...props} status={status} useAccessRequests={useAccessRequests} />
        );
      }}
    </QueryParams>
  );
};

export default AccessRequestTableWithQueryParams;
