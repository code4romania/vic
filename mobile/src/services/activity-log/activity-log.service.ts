import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  createActivityLog,
  getActivityLogById,
  getActivityLogs,
  getActivityLogsTotalCounters,
} from './activity-log.api';
import { ActivityLogFormTypes } from '../../screens/AddActivityLog';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import useStore from '../../store/store';
import { IActivityLogCounters } from '../../common/interfaces/activity-log-counters.interface';

export const useCreateActivityLogMutation = () => {
  return useMutation(['log-hours'], ({ activityLog }: { activityLog: ActivityLogFormTypes }) =>
    createActivityLog(activityLog),
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
  return useQuery(['activity-log', activityLogId], () => getActivityLogById(activityLogId), {
    enabled: !!activityLogId,
  });
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