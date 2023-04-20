/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ActivityTypes from '../../pages/ActivityTypes';

export interface ActivityTypesQueryProps {
  search?: string;
  branch?: string;
  department?: string;
  role?: string;
}

export type ActivityTypesProps = IHOCQueryProps<ActivityTypesQueryProps>;

// set defaults (if needed) for other specific filter params
const ActivityTypesWithQueryParams = () => {
  const queryConfig = {
    search: StringParam,
    branch: StringParam,
    department: StringParam,
    role: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <ActivityTypes {...props} />;
      }}
    </QueryParams>
  );
};

export default ActivityTypesWithQueryParams;
