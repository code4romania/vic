import { ActivityLogStatus } from '../../common/enums/activity-log.status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { ActivityLogFormTypes } from '../../components/ActivityLogForm';
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
        activityType: {
          name: 'Planting trees',
          id: '22',
        },
        hours: 3,
        date: new Date('2023-03-10'),
        volunteer: {
          id: '123',
          name: 'John Doe',
        },
        status: ActivityLogStatus.REJECTED,
        createdOn: new Date('2023-03-11'),
      },
      {
        id: '2',
        activityType: {
          icon: '🏥',
          name: 'Volunteering at hospital',
          id: '22',
        },
        hours: 5,
        date: new Date('2023-03-08'),
        volunteer: {
          id: '456',
          name: 'Jane Smith',
        },
        status: ActivityLogStatus.APPROVED,
        createdOn: new Date('2023-03-09'),
      },
      // ... more activity logs
    ],
    meta: {
      currentPage: 1,
      itemCount: 2,
      itemsPerPage: 5,
      totalItems: 2,
      totalPages: 10,
      orderByColumn: 'date',
      orderDirection: OrderDirection.DESC,
    },
    count: {
      pending: 55,
      rejected: 1132,
      approved: 532,
    },
  });
};

export const getActivityLog = async (id: string): Promise<IActivityLog> => {
  // return API.get(`activity-log/${id}`).then((res) => res.data);
  return Promise.resolve({
    id,
    activityType: {
      name: 'Planting trees',
      id: '22',
    },
    hours: 3,
    date: new Date('2023-03-10'),
    volunteer: {
      id: '123',
      name: 'John Doe',
    },
    status: ActivityLogStatus.PENDING,
    createdOn: new Date('2023-03-11'),
    event: { id: '222', name: 'Un eveniment frumos' },
    createdByAdmin: { id: '22', name: 'Popa Elena Luminita' },
    approvedBy: { id: '22', name: 'Popa Elena Luminita' },
    approvedOn: new Date('2024-01-02'),
    mentions: 'Face mamaliga buna',
    rejectedBy: { id: '22', name: 'Popa Elena Luminita' },
    rejectedOn: new Date('2024-01-02'),
    rejectionReason: 'Ca asa am vrut eu',
  });
};

export const addActivityLog = async (data: ActivityLogFormTypes): Promise<void> => {
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
