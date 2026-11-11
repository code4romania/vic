import { useCallback } from 'react';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';

// Keys of the queries whose answer depends on the active organization: the organization id is part
// of the key, so switching organizations never shows the previous one's entries (audit #8).
export const queryKeys = {
  activityLogs: (
    organizationId: string | undefined,
    orderDirection: OrderDirection,
    search: string,
    status: ActivityLogStatus,
  ) => ['activity-logs', organizationId, orderDirection, search, status] as const,
  activityLogsAll: ['activity-logs'] as const,
  activityLogCounters: (volunteerId: string | undefined) => ['logs-counters', volunteerId] as const,
  activityLogCountersAll: ['logs-counters'] as const,
  contractHistory: (volunteerId: string | undefined) => ['contract-history', volunteerId] as const,
};

// react-query's refetch() runs even when the query is disabled: without an active organization
// these calls must not reach the API at all (it answers 500 without one, audit #7).
export const refetchWhen =
  <T>(enabled: boolean, refetch: () => Promise<T>) =>
  (): Promise<T | undefined> =>
    enabled ? refetch() : Promise.resolve(undefined);

// Keep refetch stable for screens using it in useFocusEffect/useCallback dependencies (issue #612).
export const useRefetchWhen = <T>(enabled: boolean, refetch: () => Promise<T>) =>
  useCallback(
    (): Promise<T | undefined> => (enabled ? refetch() : Promise.resolve(undefined)),
    [enabled, refetch],
  );
