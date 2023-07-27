/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { DateParam, QueryParams, StringParam } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ContractsTable from '../../components/ContractsTable';
import {
  IPaginationQueryParams,
  getPaginationQueryParams,
} from '../../common/constants/pagination';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { VolunteerTabsOptions } from '../../pages/Volunteer';

export interface ContractsTableQueryProps extends IPaginationQueryParams {
  volunteer?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ContractStatus;
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
    volunteer: StringParam,
    search: StringParam,
    startDate: DateParam,
    endDate: DateParam,
    status: StringParam,
    activeTab: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return (
          <ContractsTable volunteerName={volunteerName} volunteerId={volunteerId} {...props} />
        );
      }}
    </QueryParams>
  );
};

export default ContractsTableWithQueryParams;
