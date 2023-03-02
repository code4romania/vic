import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { EventsTabsStatus } from '../../common/enums/event-status.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { EVENT_ERRORS } from '../../common/errors/entities/event.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { getEvents } from './event.api';

export const useEventsQuery = (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabsStatus,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['events', rowsPerPage, page, orderByColumn, orderDirection, tabsStatus],
    () => getEvents(rowsPerPage, page, tabsStatus, orderByColumn, orderDirection),
    {
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => error,
    },
  );
};
