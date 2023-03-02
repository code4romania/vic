import { EventsTabsStatus } from '../../common/enums/event-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import API from '../api';

export const getEvents = async (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabsStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
) => {
  return API.get('/events', {
    params: {
      type: tabsStatus,
      limit: rowsPerPage,
      page,
      orderBy: orderByColumn,
      orderDirection,
    },
  }).then((res) => res.data);
};
