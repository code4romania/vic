/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, DateParam, ArrayParam, withDefault } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Volunteers from '../../pages/Volunteers';

export interface VolunteersQueryProps extends IPaginationQueryParams {
  volunteerStatus?: string;
  search?: string;
  branch?: string;
  department?: string;
  role?: string;
  createdOnStart?: Date;
  createdOnEnd?: Date;
  age?: string;
  location?: string[];
}

export type VolunteerProps = IHOCQueryProps<VolunteersQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({ orderBy: 'user.name' });

// set defaults (if needed) for other specific filter params
const VolunteersWithQueryParams = () => {
  // set volunteer status default
  const VolunteerStatusParam = withDefault(StringParam, VolunteerStatus.ACTIVE);
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    volunteerStatus: VolunteerStatusParam,
    search: StringParam,
    branch: StringParam,
    department: StringParam,
    role: StringParam,
    createdOnStart: DateParam,
    createdOnEnd: DateParam,
    age: StringParam,
    location: ArrayParam,
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
