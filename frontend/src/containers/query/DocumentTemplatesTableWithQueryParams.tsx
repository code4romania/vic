/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getPaginationQueryParams, IPaginationQueryParams } from '../../common/constants/pagination';
import { DateParam, NumberParam, QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { DocumentTemplatesTable } from '../../components/DocumentTemplatesTable';

const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

export interface DocumentTemplatesQueryProps extends IPaginationQueryParams { }

export type DocumentTemplatesProps = IHOCQueryProps<DocumentTemplatesQueryProps>


export const DocumentTemplatesTableWithQueryParams = () => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    name: StringParam,
    uses: NumberParam,
    lastUseDate: DateParam,
    createdBy: StringParam,
    createdAt: DateParam,
  };
  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <DocumentTemplatesTable {...props} />;
      }}
    </QueryParams>
  );
};
