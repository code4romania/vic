import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
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
import { queryKeys, refetchWhen } from '../query-keys';

// After adding, editing or deleting an entry: the lists, the totals and the profile statistics.
const useRefreshHours = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries(queryKeys.activityLogsAll);
    queryClient.invalidateQueries(queryKeys.activityLogCountersAll);
    queryClient.invalidateQueries(['personal-statistics']);
  };
};

export const useCreateActivityLogMutation = () => {
  const { setSelectedActivityLog } = useStore();
  const refreshHours = useRefreshHours();
  return useMutation(
    ['log-hours'],
    ({ activityLog }: { activityLog: ActivityLogFormTypes }) => createActivityLog(activityLog),
    {
      onSuccess: (data: IActivityLog) => {
        setSelectedActivityLog(data);
        refreshHours();
      },
    },
  );
};

export const useUpdateActivityLog = () => {
  const { setSelectedActivityLog } = useStore();
  const refreshHours = useRefreshHours();
  return useMutation(
    ['update-hours'],
    ({ volunteerId, activityLog }: { volunteerId: string; activityLog: ActivityLogFormTypes }) =>
      updateActivityLog(volunteerId, activityLog),
    {
      onSuccess: (data: IActivityLog) => {
        setSelectedActivityLog(data);
        refreshHours();
      },
    },
  );
};

// The totals of the volunteer at the active organization; nothing to ask without one.
export const useActivityLogsCounters = (volunteerId: string | undefined) => {
  const { setCounters } = useStore();
  const enabled = !!volunteerId;
  const query = useQuery(
    queryKeys.activityLogCounters(volunteerId),
    () => getActivityLogsTotalCounters(volunteerId as string),
    {
      onSuccess: (data: IActivityLogCounters) => setCounters(data),
      enabled,
    },
  );
  return { ...query, refetch: refetchWhen(enabled, query.refetch) };
};

export const useActivityLogQuery = (activityLogId: string) => {
  const { setSelectedActivityLog } = useStore();
  return useQuery(['activity-log', activityLogId], () => getActivityLogById(activityLogId), {
    enabled: !!activityLogId,
    onSuccess: (data: IActivityLog) => setSelectedActivityLog(data),
  });
};

export const useCancelActivityLogMutation = () => {
  const refreshHours = useRefreshHours();
  return useMutation(
    ['cancel-activity-log'],
    ({ activityLogId }: { activityLogId: string }) => cancelActivityLog(activityLogId),
    { onSuccess: refreshHours },
  );
};

// The entries at the active organization (the backend reads it from the user). Without an active
// organization there is nothing to ask for: the screen shows its empty state (audit #7).
export const useActivityLogsInfiniteQuery = (
  organizationId: string | undefined,
  orderDirection: OrderDirection,
  search: string,
  status: ActivityLogStatus,
) => {
  const enabled = !!organizationId;
  const query = useInfiniteQuery(
    queryKeys.activityLogs(organizationId, orderDirection, search, status),
    ({ pageParam }) => getActivityLogs({ pageParam, orderDirection, search, status }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
      enabled,
    },
  );
  return { ...query, refetch: refetchWhen(enabled, query.refetch) };
};
