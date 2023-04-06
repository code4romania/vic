import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';

import { ACTIVITY_LOG_ERRORS } from '../../common/errors/entities/activity-log.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import {
  addActivityLog,
  approveActivityLog,
  editActivityLog,
  getActivityLog,
  getActivityLogCounter,
  getActivityLogs,
  GetActivityLogsParams,
  getActivityLogStatistics,
  rejectActivityLog,
} from './activity-log.api';

export const useActivityLogsQuery = (params: GetActivityLogsParams) => {
  return useQuery(
    [
      'activity-logs',
      params.limit,
      params.page,
      params.orderBy,
      params.orderDirection,
      params.resolutionStatus,
      params.search,
      params.status,
      params.executionDateStart,
      params.executionDateEnd,
      params.registrationDateStart,
      params.registrationDateEnd,
      params.volunteerId,
      params.approvedOrRejectedById,
    ],
    () => getActivityLogs(params),
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

export const useActivityLogCounterQuery = (volunteerId?: string) => {
  return useQuery(['activity-log-counter', volunteerId], () => getActivityLogCounter(volunteerId), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => error,
  });
};

export const useAddActivityLogMutation = () => {
  return useMutation((data: ActivityLogFormTypes) => addActivityLog(data), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => Promise.resolve(error),
  });
};

export const useEditActivityLogMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: ActivityLogFormTypes }) => editActivityLog(id, data),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

export const useApproveActivityLogMutation = () => {
  return useMutation((id: string) => approveActivityLog(id), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => Promise.resolve(error),
  });
};

export const useRejectActivityLogMutation = () => {
  return useMutation(
    ({ id, rejectionReason }: { id: string; rejectionReason?: string }) =>
      rejectActivityLog(id, rejectionReason),
    {
      onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) =>
        Promise.resolve(error),
    },
  );
};

//Activity Log Statistics
export const useActivityLogStatisticsQuery = () => {
  return useQuery(['activity-log-statistics'], () => getActivityLogStatistics(), {
    onError: (error: AxiosError<IBusinessException<ACTIVITY_LOG_ERRORS>>) => error,
  });
};
