import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ACTIVITY_LOG_ERRORS } from '../../common/errors/entities/activity-log.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import { addActivityLog, getActivityLog, getActivityLogs } from './activity-log.api';

export const useActivityLogsQuery = (
  rowsPerPage: number,
  page: number,
  tabsStatus: ActivityLogResolutionStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['activity-logs', rowsPerPage, page, orderByColumn, orderDirection, tabsStatus],
    () => getActivityLogs(rowsPerPage, page, tabsStatus, orderByColumn, orderDirection),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => error,
    },
  );
};

export const useActivityLogQuery = (id: string) => {
  return useQuery(['activity-log', id], () => getActivityLog(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => error,
  });
};

export const useAddActivityLogMutation = () => {
  return useMutation((data: ActivityLogFormTypes) => addActivityLog(data), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => Promise.resolve(error),
  });
};
