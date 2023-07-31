import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  cancelActivityLog,
  createActivityLog,
  getActivityLogById,
  getActivityLogs,
  getActivityLogsTotalCounters,
  updateActivityLog,
} from './activity-log.api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import useStore from '../../store/store';
import { IActivityLogCounters } from '../../common/interfaces/activity-log-counters.interface';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';

export const useCreateActivityLogMutation = () => {
  const { setSelectedActivityLog } = useStore();
  return useMutation(
    ['log-hours'],
    ({ activityLog }: { activityLog: ActivityLogFormTypes }) => createActivityLog(activityLog),
    {
      onSuccess: (data: IActivityLog) => setSelectedActivityLog(data),
    },
  );
};

export const useUpdateActivityLog = () => {
  const { setSelectedActivityLog } = useStore();
  return useMutation(
    ['update-hours'],
    ({ volunteerId, activityLog }: { volunteerId: string; activityLog: ActivityLogFormTypes }) =>
      updateActivityLog(volunteerId, activityLog),
    {
      onSuccess: (data: IActivityLog) => setSelectedActivityLog(data),
    },
  );
};

export const useActivityLogsCounters = (status: ActivityLogStatus, volunteerId: string) => {
  const { setCounters } = useStore();
  return useQuery(
    ['logs-counters', status, volunteerId],
    () => getActivityLogsTotalCounters(volunteerId),
    {
      onSuccess: (data: IActivityLogCounters) => setCounters(data),
      enabled: !!(status && volunteerId),
    },
  );
};

export const useActivityLogQuery = (activityLogId: string) => {
  const { setSelectedActivityLog } = useStore();
  return useQuery(['activity-log', activityLogId], () => getActivityLogById(activityLogId), {
    enabled: !!activityLogId,
    onSuccess: (data: IActivityLog) => setSelectedActivityLog(data),
  });
};

export const useCancelActivityLogMutation = () => {
  return useMutation(['cancel-activity-log'], ({ activityLogId }: { activityLogId: string }) =>
    cancelActivityLog(activityLogId),
  );
};

export const useActivityLogsInfiniteQuery = (
  orderDirection: OrderDirection,
  search: string,
  status: ActivityLogStatus,
) => {
  return useInfiniteQuery(
    ['activity-logs', orderDirection, search, status],
    ({ pageParam }) => getActivityLogs({ pageParam, orderDirection, search, status }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};
