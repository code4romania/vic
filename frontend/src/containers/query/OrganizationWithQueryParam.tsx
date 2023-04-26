/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { DivisionType } from '../../common/enums/division-type.enum';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Organization from '../../pages/Organization';

export interface OrganizationQueryProps {
  type?: string;
}

export type OrganizationTableProps = IHOCQueryProps<OrganizationQueryProps>;

const OrganizationWithQueryParams = () => {
  const TypeParam = withDefault(StringParam, DivisionType.BRANCH);
  const queryConfig = {
    type: TypeParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Organization {...props} />;
      }}
    </QueryParams>
  );
};

export default OrganizationWithQueryParams;
