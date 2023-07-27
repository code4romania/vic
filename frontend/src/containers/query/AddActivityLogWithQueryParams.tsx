/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import AddActivityLog from '../../pages/AddActivityLog';

export interface AddActivityLogQueryProps {
  volunteerName?: string;
  volunteerId?: string;
}

export type AddActivityLogProps = IHOCQueryProps<AddActivityLogQueryProps>;

const AddActivityLogWithQueryParams = () => {
  const queryConfig = {
    volunteerName: StringParam,
    volunteerId: StringParam,
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
