import { AxiosResponseHeaders } from 'axios';
import { CONSTANTS } from '../../common/constants/constants';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogStatistics } from '../../common/interfaces/activity-log-statistics.interface';
import { IActivityLog, IActivityLogListItem } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { formatEndDateISO9075, formatStartDateISO9075 } from '../../common/utils/utils';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import API from '../api';

export interface GetActivityLogsParams {
  limit: number;
  page: number;
  resolutionStatus: ActivityLogResolutionStatus;
  orderBy?: string;
  orderDirection?: OrderDirection;
  volunteerId?: string;
  approvedOrRejectedBy?: string;
  search?: string;
  status?: ActivityLogStatus;
  executionDateStart?: Date;
  executionDateEnd?: Date;
  registrationDateStart?: Date;
  registrationDateEnd?: Date;
}

export const getActivityLogs = async ({
  executionDateStart,
  executionDateEnd,
  registrationDateStart,
  registrationDateEnd,
  ...params
}: GetActivityLogsParams): Promise<IPaginatedEntity<IActivityLogListItem>> => {
  return API.get('activity-log', {
    params: {
      ...params,
      ...(executionDateStart
        ? { executionDateStart: formatStartDateISO9075(executionDateStart) }
        : {}),
      ...(executionDateEnd ? { executionDateEnd: formatEndDateISO9075(executionDateEnd) } : {}),
      ...(registrationDateStart
        ? { registrationDateStart: formatStartDateISO9075(registrationDateStart) }
        : {}),
      ...(registrationDateEnd
        ? { registrationDateEnd: formatEndDateISO9075(registrationDateEnd) }
        : {}),
    },
  }).then((res) => res.data);
};

export const getActivityLogsForDownload = async ({
  limit,
  page,
  resolutionStatus,
  orderBy,
  orderDirection,
  search,
  status,
  approvedOrRejectedBy,
  executionDateStart,
  executionDateEnd,
  volunteerId,
}: GetActivityLogsParams): Promise<{
  data: unknown;
  headers: AxiosResponseHeaders;
}> => {
  return API.get('activity-log/download', {
    params: {
      limit,
      page,
      resolutionStatus,
      orderBy,
      orderDirection,
      search,
      status,
      approvedOrRejectedBy,
      executionDateStart,
      executionDateEnd,
      volunteerId,
    },
    responseType: 'arraybuffer',
  }).then((res) => {
    return { data: res.data, headers: res.headers as AxiosResponseHeaders };
  });
};

export const getActivityLog = async (id: string): Promise<IActivityLog> => {
  return API.get(`activity-log/${id}`).then((res) => res.data);
};

export const addActivityLog = async (data: ActivityLogFormTypes): Promise<void> => {
  return API.post(`activity-log`, { ...formatAddActivityLogPayload(data) });
};

export const editActivityLog = async (id: string, data: ActivityLogFormTypes): Promise<void> => {
  return API.patch(`/activity-log/${id}`, { ...formatEditActivityLogPayload(data) });
};

export const approveActivityLog = async (id: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/approve`);
};

export const rejectActivityLog = async (id: string, rejectionReason?: string): Promise<void> => {
  return API.patch(`/activity-log/${id}/reject`, { rejectionReason });
};

export const getActivityLogCounter = async (
  volunteerId?: string,
): Promise<{
  pending: number;
  approved: number;
  rejected: number;
}> => {
  return API.get('/activity-log/counters', { params: { volunteerId } }).then((res) => res.data);
};

const formatAddActivityLogPayload = (data: ActivityLogFormTypes): object => {
  const { volunteer, task, event, ...payload } = data;
  return {
    ...payload,
    volunteerId: volunteer.value,
    ...(task.value !== CONSTANTS.OTHER ? { activityTypeId: task.value } : {}),
    ...(event ? { eventId: event.value } : {}),
  };
};

const formatEditActivityLogPayload = (data: ActivityLogFormTypes): object => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { volunteer, task, event, ...payload } = data;

  return {
    ...payload,
    ...(task.value !== CONSTANTS.OTHER ? { activityTypeId: task.value } : {}),
    ...(event ? { eventId: event.value } : {}),
  };
};

//Activity Log Statistics
export const getActivityLogStatistics = async (): Promise<IActivityLogStatistics> => {
  return API.get('/dashboard/volunteer-hours').then((res) => res.data);
};
