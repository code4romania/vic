/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ContractsTable from '../../components/ContractsTable';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { DocumentType } from '../../common/enums/document-type.enum';
import { VolunteerTabsOptions } from '../../pages/Volunteer';

export interface ContractsTableQueryProps extends IPaginationQueryParams {
  status?: ContractStatus;
  type?: DocumentType;
  activeTab?: VolunteerTabsOptions;
}

export type ContractsTableBasicProps = IHOCQueryProps<ContractsTableQueryProps>;

const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const ContractsTableWithQueryParams = ({
  volunteerId,
  readOnly,
}: {
  volunteerId?: string;
  readOnly?: boolean;
}) => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    status: StringParam,
    type: StringParam,
    activeTab: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => <ContractsTable volunteerId={volunteerId} readOnly={readOnly} {...props} />}
    </QueryParams>
  );
};

export default ContractsTableWithQueryParams;
