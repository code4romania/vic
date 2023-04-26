/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { RSVPGoingEnum } from '../../common/enums/rsvp.enum';
import RsvpTable from '../../components/RsvpTable';

export interface RsvpTableQueryProps extends IPaginationQueryParams {
  activeTab?: string;
  search?: string;
  branch?: string;
  department?: string;
  role?: string;
  going?: RSVPGoingEnum;
}

export type RsvpTableBasicProps = IHOCQueryProps<RsvpTableQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({});

// set defaults (if needed) for other specific filter params
const RsvpTableWithQueryParams = ({ eventId }: { eventId: string }) => {
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    activeTab: StringParam,
    search: StringParam,
    branch: StringParam,
    department: StringParam,
    role: StringParam,
    going: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <RsvpTable {...props} eventId={eventId} />;
      }}
    </QueryParams>
  );
};

export default RsvpTableWithQueryParams;
