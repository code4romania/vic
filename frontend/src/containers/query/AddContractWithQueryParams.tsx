/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import AddContract from '../../pages/AddContract';

export interface AddContractQueryProps {
  volunteerName?: string;
  volunteerId?: string;
}

export type AddContractProps = IHOCQueryProps<AddContractQueryProps>;

const AddContractWithQueryParams = () => {
  const queryConfig = {
    volunteerName: StringParam,
    volunteerId: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <AddContract {...props} />;
      }}
    </QueryParams>
  );
};

export default AddContractWithQueryParams;
