/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';
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
  search?: string;
  activeTab?: VolunteerTabsOptions;
}

export type ContractsTableBasicProps = IHOCQueryProps<ContractsTableQueryProps>;

const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const ContractsTableWithQueryParams = ({
  volunteerId,
  readOnly,
  renderHeader,
}: {
  volunteerId?: string;
  readOnly?: boolean;
  renderHeader?: (actions: ReactNode) => ReactNode;
}) => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    status: StringParam,
    type: StringParam,
    search: StringParam,
    activeTab: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => (
        <ContractsTable
          volunteerId={volunteerId}
          readOnly={readOnly}
          renderHeader={renderHeader}
          {...props}
        />
      )}
    </QueryParams>
  );
};

export default ContractsTableWithQueryParams;
