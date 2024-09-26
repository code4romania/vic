/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DateParam, QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';
import { VolunteerTabsOptions } from '../../pages/Volunteer';
import DocumentContractsTable from '../../components/DocumentContractsTable';
import { DocumentContractStatusForFilter } from '../../common/enums/document-contract-status.enum';

export interface ContractsTableQueryProps extends IPaginationQueryParams {
  volunteer?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: DocumentContractStatusForFilter;
  activeTab?: VolunteerTabsOptions;
}

export type ContractsTableBasicProps = IHOCQueryProps<ContractsTableQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

const ContractsTableWithQueryParams = ({
  volunteerName,
  volunteerId,
}: {
  volunteerName?: string;
  volunteerId?: string;
}) => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    search: StringParam,
    volunteerId: StringParam,
    status: StringParam,
    startDate: DateParam,
    endDate: DateParam,
    activeTab: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return (
          <DocumentContractsTable
            volunteerName={volunteerName}
            volunteerId={volunteerId}
            {...props}
          />
        );
      }}
    </QueryParams>
  );
};

export default ContractsTableWithQueryParams;
