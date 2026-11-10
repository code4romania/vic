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
  getRsvps,
  publishEvent,
  getEventCounters,
  getEventCandidates,
  addVolunteersToEvent,
  getEventRegistrations,
  approveEventRegistration,
  rejectEventRegistration,
} from './event.api';
import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';

export const useEventsQuery = (
  limit: number,
  page: number,
  eventState: EventState,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
  departmentId?: string,
  search?: string,
) => {
  return useQuery(
    ['events', limit, page, orderByColumn, orderDirection, eventState, departmentId, search],
    () => getEvents(limit, page, eventState, orderByColumn, orderDirection, search, departmentId),
    {
      enabled: !!(limit && page && eventState),
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => error,
    },
  );
};

export const useRsvpsQuery = (
  id: string,
  limit: number = PaginationConfig.defaultRowsPerPage,
  page: number = PaginationConfig.defaultPage,
  orderByColumn?: string,
  orderDirection?: OrderDirection,
  search?: string,
  branch?: string,
  department?: string,
  role?: string,
  going?: string,
) => {
  return useQuery(
    [
      'rsvp',
      id,
      limit,
      page,
      orderByColumn,
      orderDirection,
      search,
      branch,
      department,
      role,
      going,
    ],
    () =>
      getRsvps(
        id,
        limit,
        page,
        orderByColumn,
        orderDirection,
        search,
        branch,
        department,
        role,
        going,
      ),
    {
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => error,
      enabled: !!id,
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

export const useEventCountersQuery = (departmentId?: string) => {
  return useQuery(['event-counters', departmentId], () => getEventCounters(departmentId));
};

export const useEventCandidatesQuery = (eventId: string, search?: string) => {
  return useQuery(
    ['event-candidates', eventId, search],
    () => getEventCandidates(eventId, search),
    {
      keepPreviousData: true,
    },
  );
};

export const useAddVolunteersToEventMutation = () => {
  return useMutation(
    ({ eventId, volunteerIds }: { eventId: string; volunteerIds: string[] }) =>
      addVolunteersToEvent(eventId, volunteerIds),
    {
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
    },
  );
};

// #501
export const useEventRegistrationsQuery = (params: {
  status: EventRegistrationStatus;
  page: number;
  limit: number;
  search?: string;
  // one event's registrations (event page, pending count in the events list)
  eventId?: string;
}) => {
  return useQuery(['event-registrations', params], () => getEventRegistrations(params), {
    keepPreviousData: true,
    onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => error,
  });
};

export const useDecideEventRegistrationMutation = () => {
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      reason === undefined ? approveEventRegistration(id) : rejectEventRegistration(id, reason),
    {
      onError: (error: AxiosError<IBusinessException<EVENT_ERRORS>>) => Promise.resolve(error),
    },
  );
};
