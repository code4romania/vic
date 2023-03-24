import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
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
  search?: string,
  status?: ActivityLogStatus,
  executionDateStart?: Date,
  executionDateEnd?: Date,
  registrationDateStart?: Date,
  registrationDateEnd?: Date,
): Promise<IPaginatedEntity<IActivityLogListItem>> => {
  return API.get('activity-log', {
    params: {
      resolutionStatus,
      limit,
      page,
      orderBy,
      orderDirection,
      search,
      status,
      executionDateStart,
      executionDateEnd,
      registrationDateStart,
      registrationDateEnd,
    },
  }).then((res) => res.data);
};

export const getActivityLog = async (id: string): Promise<IActivityLog> => {
  return API.get(`activity-log/${id}`).then((res) => res.data);
};

export const addActivityLog = async (data: ActivityLogFormTypes): Promise<void> => {
  return API.post(`activity-log`, { ...formatAddActivityLogPayload(data) });
};

export const editActivityLog = (id: string, data: ActivityLogFormTypes): Promise<void> => {
  return API.patch(`/activity-log/${id}`, { ...formatEditActivityLogPayload(data) });
};

export const approveActivityLog = (id: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/approve`);
};

export const rejectActivityLog = (id: string, rejectionReason?: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/reject`, { rejectionReason });
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { volunteer, task, event, ...payload } = data;

  return {
    ...payload,
    activityTypeId: task.value,
    ...(event ? { eventId: event.value } : {}),
  };
};
