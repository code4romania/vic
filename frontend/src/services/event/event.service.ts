import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { PaginationConfig } from '../../common/constants/pagination';
import { EventState } from '../../common/enums/event-state.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { EVENT_ERRORS } from '../../common/errors/entities/event.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { EventFormTypes } from '../../components/EventForm';
import {
  addEvent,
  archiveEvent,
  deleteEvent,
  editEvent,
  getEvent,
  getEvents,
  publishEvent,
} from './event.api';

export const useEventsQuery = (
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  eventState: EventState,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
) => {
  return useQuery(
    ['events', limit, page, orderByColumn, orderDirection, eventState],
    () => getEvents(limit, page, eventState, orderByColumn, orderDirection),
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
  return useMutation((data: EventFormTypes) => addEvent(data), {
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
  });
};

export const useEditEventMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Omit<EventFormTypes, 'status'> }) => editEvent(id, data),
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
