import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogTabs } from '../../pages/ActivityLog';
// import API from '../api';

interface IPaginatedActivityLog extends IPaginatedEntity<IActivityLog> {
  count: {
    pending?: number;
    rejected?: number;
    approved?: number;
  };
}

export const getActivityLogs = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: ActivityLogTabs,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedActivityLog> => {
  // return API.get('activity-log', {
  //   params: {
  //     type: tabsStatus,
  //     limit: rowsPerPage,
  //     page,
  //     orderBy: orderByColumn,
  //     orderDirection,
  //   },
  // }).then((res) => res.data);
  console.log(rowsPerPage, page, tabsStatus, orderByColumn, orderDirection);
  return Promise.resolve({
    items: [
      {
        id: '1',
        task: {
          icon: '🌳',
          name: 'Planting trees',
        },
        hours: 3,
        executionDate: new Date('2023-03-10'),
        volunteer: {
          id: '123',
          name: 'John Doe',
        },
        status: ActivityLogStatus.REJECTED,
        registrationDate: new Date('2023-03-11'),
      },
      {
        id: '2',
        task: {
          icon: '🏥',
          name: 'Volunteering at hospital',
        },
        hours: 5,
        executionDate: new Date('2023-03-08'),
        volunteer: {
          id: '456',
          name: 'Jane Smith',
        },
        status: ActivityLogStatus.APPROVED,
        registrationDate: new Date('2023-03-09'),
      },
      // ... more activity logs
    ],
    meta: {
      currentPage: 1,
      itemCount: 2,
      itemsPerPage: 5,
      totalItems: 2,
      totalPages: 10,
      orderByColumn: 'executionDate',
      orderDirection: OrderDirection.DESC,
    },
    count: {
      pending: 55,
      rejected: 1132,
      approved: 532,
    },
  });
};
