import { ActivityLogResolutionStatus } from '../../common/enums/activity-log-resolution-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogListItem } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
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

export const getActivityLog = async (id: string): Promise<unknown> => {
  return API.get(`activity-log/${id}`).then((res) => res.data);
};

export const addActivityLog = async (data: unknown): Promise<void> => {
  // return API.post(`/activity-log`, { ...formatAddActivityLogPayload(data) });
  console.log(data);
  return Promise.resolve();
};

// const formatAddActivityLogPayload = (data: ActivityLogFormTypes): object => {
//   const { volunteer, task, event, ...payload } = data;
//   return {
//     ...payload,
//     volunteerId: volunteer.value,
//     activityTypeId: task.value,
//     eventId: event?.value,
//   };
// };
