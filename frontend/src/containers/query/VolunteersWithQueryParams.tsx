/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Volunteers from '../../pages/Volunteers';

export interface VolunteersQueryProps extends IPaginationQueryParams {
  volunteerStatus?: string;
  search?: string;
  branch?: string;
  department?: string;
  role?: string;
  activityTypeId?: string;
}

export type VolunteersProps = IHOCQueryProps<VolunteersQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({ orderBy: 'user.name' });

// set defaults (if needed) for other specific filter params
const VolunteersWithQueryParams = () => {
  // no status = every status (#476)
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    volunteerStatus: StringParam,
    search: StringParam,
    branch: StringParam,
    department: StringParam,
    role: StringParam,
    activityTypeId: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Volunteers {...props} />;
      }}
    </QueryParams>
  );
};

export default VolunteersWithQueryParams;
