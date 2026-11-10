import { queryKeys, refetchWhen } from './query-keys';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';

describe('query keys', () => {
  it('the hours list of two organizations never share a cache entry', () => {
    const a = queryKeys.activityLogs('org-a', OrderDirection.DESC, '', ActivityLogStatus.PENDING);
    const b = queryKeys.activityLogs('org-b', OrderDirection.DESC, '', ActivityLogStatus.PENDING);
    expect(a).not.toEqual(b);
    // still under the prefix the mutations invalidate
    expect(a[0]).toBe(queryKeys.activityLogsAll[0]);
  });

  it('the totals and the contracts are keyed by the volunteer of the organization', () => {
    expect(queryKeys.activityLogCounters('v1')).not.toEqual(queryKeys.activityLogCounters('v2'));
    expect(queryKeys.contractHistory('v1')).not.toEqual(queryKeys.contractHistory('v2'));
  });
});

describe('refetchWhen', () => {
  it('does not reach the API while the query is disabled (no active organization)', async () => {
    const refetch = jest.fn(async () => 'data');
    await expect(refetchWhen(false, refetch)()).resolves.toBeUndefined();
    expect(refetch).not.toHaveBeenCalled();
    await expect(refetchWhen(true, refetch)()).resolves.toBe('data');
  });
});
