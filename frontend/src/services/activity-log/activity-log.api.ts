import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLog, IActivityLogListItem } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import API from '../api';

export const getActivityLogs = async (
  limit: number,
  page: number,
  resolutionStatus: ActivityLogResolutionStatus,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IActivityLogListItem>> => {
  return API.get('activity-log', {
    params: {
      resolutionStatus,
      limit,
      page,
      orderBy,
      orderDirection,
    },
  }).then((res) => res.data);
};

export const getActivityLog = async (id: string): Promise<IActivityLog> => {
  return API.get(`activity-log/${id}`).then((res) => res.data);
};

export const addActivityLog = async (data: ActivityLogFormTypes): Promise<void> => {
  return API.post(`activity-log`, { ...formatAddActivityLogPayload(data) });
};

const formatAddActivityLogPayload = (data: ActivityLogFormTypes): object => {
  const { volunteer, task, event, ...payload } = data;
  return {
    ...payload,
    volunteerId: volunteer.value,
    activityTypeId: task.value,
    ...(event ? { eventId: event.value } : {}),
  };
};

const formatEditActivityLogPayload = (data: ActivityLogFormTypes): object => {
  const { volunteer, task, event, ...payload } = data;
  volunteer;

  return {
    ...payload,
    activityTypeId: task.value,
    ...(event ? { eventId: event.value } : {}),
  };
};
export const editActivityLog = (id: string, data: ActivityLogFormTypes): Promise<void> => {
  console.log({ ...formatEditActivityLogPayload(data) });
  // return API.patch(`/activity-log/${id}`, { ...formatEditActivityLogPayload(data) });
  return Promise.resolve();
};

export const approveActivityLog = (id: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/approve`);
};

export const rejectActivityLog = (id: string, rejectionReason?: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/reject`, { rejectionReason });
};
