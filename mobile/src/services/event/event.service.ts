import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { getEvent, getEvents, setRsvpEvent } from './event.api';
import { EventType } from '../../common/enums/event-type.enum';

export interface RsvpResponse {
  going: boolean;
  mention?: string;
}

export const useEventsInfiniteQuery = (
  orderDirection: OrderDirection,
  search: string,
  eventFilter: EventType,
) => {
  return useInfiniteQuery(
    ['events', orderDirection, search, eventFilter],
    ({ pageParam }) => getEvents({ pageParam, orderDirection, search, eventFilter }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};

export const useEventQuery = (eventId: string) =>
  useQuery(['event', eventId], () => getEvent(eventId), { enabled: !!eventId });

export const useSetRsvpEventMutation = () => {
  return useMutation(['rsvp-event'], ({ eventId, rsvp }: { eventId: string; rsvp: RsvpResponse }) =>
    setRsvpEvent(eventId, rsvp),
  );
};
