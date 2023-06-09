import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogItem } from '../../common/interfaces/activity-log-item.interface';
import { IOrganizationStructureItem } from '../../common/interfaces/organization-structure-item.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogFormTypes } from '../../screens/AddActivityLog';
import API from '../api';

interface PaginationQuery {
  pageParam?: number;
  orderDirection: OrderDirection;
  search: string;
  status: ActivityLogStatus;
}

export const createActivityLog = async (
  payload: ActivityLogFormTypes,
): Promise<IOrganizationStructureItem[]> => {
  return API.post('/mobile/activity-log', payload).then((res) => res.data);
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
