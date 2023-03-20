import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLogListItem } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogTabs } from '../../pages/ActivityLogs';
import API from '../api';

export const getActivityLogs = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: ActivityLogTabs,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IActivityLogListItem>> => {
  return API.get('activity-log', {
    params: {
      type: tabsStatus,
      limit: rowsPerPage,
      page,
      orderBy: orderByColumn,
      orderDirection,
    },
  }).then((res) => res.data);
};
