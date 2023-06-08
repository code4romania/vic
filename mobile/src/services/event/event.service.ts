import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { cancelRsvp, getEvent, getEvents, setRsvpEvent } from './event.api';
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

export const useEventQuery = (eventId: string) => {
  const { setEvent } = useStore();
  return useQuery(['event', eventId], () => getEvent(eventId), {
    onSuccess: (data: IEvent) => setEvent(data),
    enabled: !!eventId,
  });
};

export const useSetRsvpEventMutation = () => {
  return useMutation(
    ['rsvp-event'],
    ({ eventId, rsvp }: { eventId: string; rsvp: RsvpResponse }) => {
      return setRsvpEvent(eventId, rsvp);
    },
  );
};

export const useCancelRsvpMutation = () => {
  const { canceRsvp } = useStore();
  return useMutation(
    ['cancel-rsvp-event'],
    ({ eventId }: { eventId: string }) => cancelRsvp(eventId),
    {
      onSuccess: canceRsvp,
    },
  );
};
