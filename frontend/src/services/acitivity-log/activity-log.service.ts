import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACTIVITY_LOG_ERRORS } from '../../common/errors/entities/activity-log.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getActivityLogs } from './activity-log.api';

export const useActivityLogsQuery = (
  rowsPerPage: number,
  page: number,
  tabsStatus: ActivityLogResolutionStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['activity-log', rowsPerPage, page, orderByColumn, orderDirection, tabsStatus],
    () => getActivityLogs(rowsPerPage, page, tabsStatus, orderByColumn, orderDirection),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => error,
    },
  );
};
