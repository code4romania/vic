/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, DateParam, withDefault } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import ActivityLogTable from '../../components/ActivityLogTable';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { VolunteerTabsOptions } from '../../pages/Volunteer';
import { VolunteerStatus } from '../../common/enums/volunteer-status.enum';

export interface ActivityLogTableQueryProps extends IPaginationQueryParams {
  resolutionStatus?: ActivityLogResolutionStatus;
  activeTab?: VolunteerTabsOptions;
  search?: string;
  status?: ActivityLogStatus;
  executionDateStart?: Date;
  executionDateEnd?: Date;
  registrationDateStart?: Date;
  registrationDateEnd?: Date;
  approvedOrRejectedBy?: string;
}

export type ActivityLogTableBasicProps = IHOCQueryProps<ActivityLogTableQueryProps>;

const DEFAULT_QUERY_PARAMS = getPaginationQueryParams();

// set defaults (if needed) for other specific filter params
const ActivityLogTableWithQueryParams = ({
  resolutionStatus,
  volunteerId,
  volunteerStatus,
}: {
  resolutionStatus?: ActivityLogResolutionStatus;
  volunteerId?: string;
  volunteerStatus?: VolunteerStatus;
}) => {
  // set request status default
  const ResolutionStatusParam = withDefault(
    StringParam,
    resolutionStatus || ActivityLogResolutionStatus.NEW,
  );
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    resolutionStatus: ResolutionStatusParam,
    activeTab: StringParam,
    search: StringParam,
    status: StringParam,
    executionDateStart: DateParam,
    executionDateEnd: DateParam,
    registrationDateStart: DateParam,
    registrationDateEnd: DateParam,
    approvedOrRejectedBy: StringParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return (
          <ActivityLogTable
            {...props}
            resolutionStatus={resolutionStatus}
            volunteerId={volunteerId}
            volunteerStatus={volunteerStatus}
          />
        );
      }}
    </QueryParams>
  );
};

export default ActivityLogTableWithQueryParams;
