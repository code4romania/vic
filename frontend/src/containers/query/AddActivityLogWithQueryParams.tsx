/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParamConfig, QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import AddActivityLog from '../../pages/AddActivityLog';

export interface AddActivityLogQueryProps {
  volunteerName?: string;
  volunteerId?: string;
  // #481: add an activity (no event) from the volunteer's Activities tab
  activity?: boolean;
}

export type AddActivityLogProps = IHOCQueryProps<AddActivityLogQueryProps>;

// The Activities tab links with activity=true; BooleanParam only reads 1/0, so it was ignored.
const ActivityFlagParam: QueryParamConfig<boolean | null | undefined> = {
  encode: (value) => (value == null ? value : value ? 'true' : 'false'),
  decode: (value) => (value == null ? undefined : value === 'true' || value === '1'),
};

const AddActivityLogWithQueryParams = () => {
  const queryConfig = {
    volunteerName: StringParam,
    volunteerId: StringParam,
    activity: ActivityFlagParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <AddActivityLog {...props} />;
      }}
    </QueryParams>
  );
};

export default AddActivityLogWithQueryParams;
