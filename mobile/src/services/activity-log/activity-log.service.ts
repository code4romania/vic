import { useInfiniteQuery, useMutation } from 'react-query';
import { createActivityLog, getActivityLogs } from './activity-log.api';
import { ActivityLogFormTypes } from '../../screens/AddActivityLog';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';

export const useCreateActivityLogMutation = () => {
  return useMutation(['log-hours'], ({ activityLog }: { activityLog: ActivityLogFormTypes }) =>
    createActivityLog(activityLog),
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
