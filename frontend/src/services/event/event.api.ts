import { EventsTabsStatus } from '../../common/enums/event-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IEvent, OrganizationStructureType } from '../../common/interfaces/event.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
// import API from '../api';

export const getEvents = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabsStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IEvent>> => {
  // return API.get('/events', {
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
        name: 'Annual Company Conference',
        startDate: new Date('2023-09-24T09:12:00'),
        endDate: new Date('2023-09-24T17:32:00'),
        target: [
          { id: '1', name: 'New York Branch', type: OrganizationStructureType.BRANCH, members: 25 },
          {
            id: '2',
            name: 'San Francisco Branch',
            type: OrganizationStructureType.BRANCH,
            members: 18,
          },
          { id: '3', name: 'London Branch', type: OrganizationStructureType.BRANCH, members: 20 },
          {
            id: '4',
            name: 'Singapore Branch',
            type: OrganizationStructureType.BRANCH,
            members: 12,
          },
        ],
        rsvp: { yes: 75, no: 10 },
        displayStatus: 'published',
        reportedHours: '16 hours',
      },
    ],
    meta: {
      itemCount: 0,
      totalItems: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
  });
};
