import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { EventsTabs } from '../../common/enums/events-tabs.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { EVENT_ERRORS } from '../../common/errors/entities/event.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  addEvent,
  archiveEvent,
  deleteEvent,
  editEvent,
  getEvent,
  getEvents,
  IAddEventData,
  publishEvent,
} from './event.api';

export const useEventsQuery = (
  rowsPerPage: number,
  page: number,
  tabsStatus: EventsTabs,
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

export const useEventQuery = (id: string) => {
  return useQuery(['event', id], () => getEvent(id), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => error,
  });
};

export const useAddEventMutation = () => {
  return useMutation((data: IAddEventData) => addEvent(data), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useEditEventMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Omit<IAddEventData, 'status'> }) => editEvent(id, data),
    {
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
    },
  );
};

export const useArchiveEventMutation = () => {
  return useMutation((id: string) => archiveEvent(id), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const usePublishEventMutation = () => {
  return useMutation((id: string) => publishEvent(id), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useDeleteEventMutation = () => {
  return useMutation((id: string) => deleteEvent(id), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
  });
};
