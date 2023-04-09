/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import ActivityLogs from '../../pages/ActivityLogs';

export interface ActivityLogsQueryProps {
  resolutionStatus?: ActivityLogResolutionStatus;
}

export type ActivityLogsProps = IHOCQueryProps<ActivityLogsQueryProps>;

const ActivityLogsWithQueryParams = () => {
  const ResolutionStatusParam = withDefault(StringParam, ActivityLogResolutionStatus.NEW);
  const queryConfig = {
    resolutionStatus: ResolutionStatusParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <ActivityLogs {...props} />;
      }}
    </QueryParams>
  );
};

export default ActivityLogsWithQueryParams;
