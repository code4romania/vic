/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { RequestStatus } from '../../common/enums/request-status.enum';
import AccessRequests from '../../pages/AccessRequests';

export interface AccessRequestsQueryProps {
  requestStatus?: RequestStatus;
}

export type AccessRequestsProps = IHOCQueryProps<AccessRequestsQueryProps>;

const AccessRequestsWithQueryParams = () => {
  const RequestStatusParam = withDefault(StringParam, RequestStatus.PENDING);

  const queryConfig = {
    requestStatus: RequestStatusParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <AccessRequests {...props} />;
      }}
    </QueryParams>
  );
};

export default AccessRequestsWithQueryParams;
