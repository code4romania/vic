import { endOfDay, formatISO9075 } from 'date-fns';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogCounters } from '../../common/interfaces/activity-log-counters.interface';
import { IActivityLogItem } from '../../common/interfaces/activity-log-item.interface';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
  status: ActivityLogStatus;
}

export const createActivityLog = async (payload: ActivityLogFormTypes): Promise<IActivityLog> => {
  return API.post('/mobile/activity-log', {
    ...payload,
    date: formatISO9075(endOfDay(payload.date)),
  }).then((res) => res.data);
};

export const updateActivityLog = async (
  volunteerId: string,
  updates: Partial<ActivityLogFormTypes>,
): Promise<IActivityLog> => {
  return API.patch(`/mobile/activity-log/${volunteerId}`, {
    ...updates,
    ...(updates.date ? { date: formatISO9075(endOfDay(updates.date)) } : {}),
  }).then((res) => res.data);
};

export const getActivityLogs = async ({
  pageParam = 1,
  status,
  ...params
}: PaginationQuery): Promise<IPaginatedEntity<IActivityLogItem>> => {
  return API.get('/mobile/activity-log', {
    params: {
      limit: 25,
      page: pageParam,
      ...(status === ActivityLogStatus.PENDING
        ? { resolutionStatus: 'new' }
        : { resolutionStatus: 'solved' }),
      ...(status === ActivityLogStatus.APPROVED ? { status: 'approved' } : {}),
      ...(status === ActivityLogStatus.REJECTED ? { status: 'rejected' } : {}),
      ...params,
    },
  }).then((res) => res.data);
};

export const getActivityLogsTotalCounters = async (
  volunteerId: string,
): Promise<IActivityLogCounters> => {
  return API.get('/mobile/activity-log/counters', { params: { volunteerId } }).then(
    (res) => res.data,
  );
};

export const getActivityLogById = async (activityLogId: string): Promise<IActivityLog> => {
  return API.get(`/mobile/activity-log/${activityLogId}`).then((res) => res.data);
};

export const cancelActivityLog = async (activityLogId: string): Promise<void> => {
  return API.delete(`/mobile/activity-log/${activityLogId}`).then((res) => res.data);
};
