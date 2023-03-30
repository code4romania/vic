import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
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
  rejectActivityLog,
} from './activity-log.api';

export const useActivityLogsQuery = (
  rowsPerPage: number,
  page: number,
  tabsStatus: ActivityLogResolutionStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
  search?: string,
  status?: ActivityLogStatus,
  executionDateStart?: Date,
  executionDateEnd?: Date,
  registrationDateStart?: Date,
  registrationDateEnd?: Date,
) => {
  return useQuery(
    [
      'activity-logs',
      rowsPerPage,
      page,
      orderByColumn,
      orderDirection,
      tabsStatus,
      search,
      status,
      executionDateStart,
      executionDateEnd,
      registrationDateStart,
      registrationDateEnd,
    ],
    () =>
      getActivityLogs(
        rowsPerPage,
        page,
        tabsStatus,
        orderByColumn,
        orderDirection,
        search,
        status,
        executionDateStart,
        executionDateEnd,
        registrationDateStart,
        registrationDateEnd,
      ),
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

export const useActivityLogCounterQuery = () => {
  return useQuery(['activity-log-counter'], () => getActivityLogCounter(), {
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
