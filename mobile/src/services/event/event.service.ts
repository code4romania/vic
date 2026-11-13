import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import {
  cancelRsvp,
  EventsFilters,
  getEvent,
  getEvents,
  getEventsCounts,
  setRsvpEvent,
} from './event.api';
import { EventType } from '../../common/enums/event-type.enum';
import useStore from '../../store/store';
import { IEvent } from '../../common/interfaces/event.interface';

export interface RsvpResponse {
  going: boolean;
  mention?: string;
}

export const useEventsInfiniteQuery = (
  orderDirection: OrderDirection,
  search: string,
  eventFilter: EventType,
  filters: EventsFilters = {},
) => {
  return useInfiniteQuery(
    ['events', orderDirection, search, eventFilter, filters],
    ({ pageParam }) => getEvents({ pageParam, orderDirection, search, eventFilter, ...filters }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};

/** query key of the segment badges; an RSVP invalidates it */
export const EVENTS_COUNTS_KEY = 'events-counts';

/** The badges of the three Evenimente segments, for the list's search and filters */
export const useEventsCountsQuery = (search: string, filters: EventsFilters = {}) => {
  return useQuery([EVENTS_COUNTS_KEY, search, filters], () =>
    getEventsCounts({ search, ...filters }),
  );
};

export const useEventQuery = (eventId: string) => {
  const { setEvent } = useStore();
  return useQuery(['event', eventId], () => getEvent(eventId), {
    onSuccess: (data: IEvent) => setEvent(data),
    enabled: !!eventId,
  });
};

export const useSetRsvpEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ['rsvp-event'],
    ({ eventId, rsvp }: { eventId: string; rsvp: RsvpResponse }) => {
      return setRsvpEvent(eventId, rsvp);
    },
    {
      // the "Particip" badge follows the answer
      onSuccess: () => queryClient.invalidateQueries(EVENTS_COUNTS_KEY),
    },
  );
};

export const useCancelRsvpMutation = () => {
  const { canceRsvp } = useStore();
  const queryClient = useQueryClient();
  return useMutation(
    ['cancel-rsvp-event'],
    ({ eventId }: { eventId: string }) => cancelRsvp(eventId),
    {
      onSuccess: () => {
        canceRsvp();
        queryClient.invalidateQueries(EVENTS_COUNTS_KEY);
      },
    },
  );
};
