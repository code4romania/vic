import { AxiosResponseHeaders } from 'axios';
import { CONSTANTS } from '../../common/constants/constants';
import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { ActivityLogSource } from '../../common/enums/activity-log-source.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogStatistics } from '../../common/interfaces/activity-log-statistics.interface';
import { IActivityLog, IActivityLogListItem } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { formatEndDateISO9075, formatStartDateISO9075 } from '../../common/utils/utils';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
import API from '../api';
import { format } from 'date-fns';

export interface GetActivityLogsParams {
  limit: number;
  page: number;
  // left out: every status
  resolutionStatus?: ActivityLogResolutionStatus;
  // #481: only hours logged on events, or only on activities
  source?: ActivityLogSource;
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

// One mapping for the list and its export, so the file holds exactly the rows on screen.
export const activityLogFilterParams = ({
  executionDateStart,
  executionDateEnd,
  registrationDateStart,
  registrationDateEnd,
  ...params
}: GetActivityLogsParams): Record<string, unknown> => ({
  ...params,
  ...(executionDateStart ? { executionDateStart: format(executionDateStart, 'yyyy-MM-dd') } : {}),
  ...(executionDateEnd ? { executionDateEnd: format(executionDateEnd, 'yyyy-MM-dd') } : {}),
  ...(registrationDateStart
    ? { registrationDateStart: formatStartDateISO9075(registrationDateStart) }
    : {}),
  ...(registrationDateEnd
    ? { registrationDateEnd: formatEndDateISO9075(registrationDateEnd) }
    : {}),
});

export const getActivityLogs = async (
  params: GetActivityLogsParams,
): Promise<IPaginatedEntity<IActivityLogListItem>> => {
  return API.get('activity-log', { params: activityLogFilterParams(params) }).then(
    (res) => res.data,
  );
};

// The API exports every matching row: page and limit are ignored there.
export const getActivityLogsForDownload = async (
  params: GetActivityLogsParams,
): Promise<{
  data: unknown;
  headers: AxiosResponseHeaders;
}> => {
  return API.get('activity-log/download', {
    params: activityLogFilterParams(params),
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

// #483: hours added by hand from the volunteer's profile (saved approved)
export const addVolunteerHours = async ({
  volunteerId,
  hours,
  date,
  mentions,
  event,
}: {
  volunteerId: string;
  hours: number;
  date: Date;
  mentions?: string;
  event?: { value: string };
}): Promise<void> => {
  return API.post('activity-log', {
    volunteerId,
    hours,
    date: format(date, 'yyyy-MM-dd'),
    ...(mentions ? { mentions } : {}),
    ...(event ? { eventId: event.value } : {}),
  });
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
    date: format(payload.date, 'yyyy-MM-dd'),
    volunteerId: volunteer.value,
    ...(task.value !== CONSTANTS.OTHER ? { activityTypeId: task.value } : {}),
    ...(event ? { eventId: event.value } : {}),
  };
};

export const formatEditActivityLogPayload = (data: ActivityLogFormTypes): object => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { volunteer, task, event, ...payload } = data;

  return {
    ...payload,
    date: format(payload.date, 'yyyy-MM-dd'),
    ...(task.value !== CONSTANTS.OTHER ? { activityTypeId: task.value } : {}),
    // null removes the event from the log; leaving the field out would keep the old one
    eventId: event?.value ?? null,
  };
};

//Activity Log Statistics
export const getActivityLogStatistics = async (): Promise<IActivityLogStatistics> => {
  return API.get('/dashboard/volunteer-hours').then((res) => res.data);
};
