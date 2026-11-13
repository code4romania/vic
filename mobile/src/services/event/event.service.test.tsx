import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  EVENTS_COUNTS_KEY,
  useCancelRsvpMutation,
  useEventsCountsQuery,
  useSetRsvpEventMutation,
} from './event.service';
import { cancelRsvp, getEventsCounts, setRsvpEvent } from './event.api';
import useStore from '../../store/store';

jest.mock('./event.api', () => ({
  getEventsCounts: jest.fn(),
  setRsvpEvent: jest.fn(async () => undefined),
  cancelRsvp: jest.fn(async () => undefined),
}));

const setup = async <T,>(hook: () => T) => {
  // no garbage-collection timers left behind, so jest can exit
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: Infinity },
    },
  });
  const invalidate = jest.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = await renderHook(hook, { wrapper });
  return { result, invalidate };
};

describe('segment counts', () => {
  it('asks for the counts with the search and filters', async () => {
    (getEventsCounts as jest.Mock).mockResolvedValue({ open: 1, going: 2, organizations: 3 });
    const { result } = await setup(() => useEventsCountsQuery('mar', { organizationId: 'org-1' }));
    await act(async () => undefined);
    expect(getEventsCounts).toHaveBeenCalledWith({ search: 'mar', organizationId: 'org-1' });
    expect(result.current.data).toEqual({ open: 1, going: 2, organizations: 3 });
  });

  it('an RSVP refreshes the badges', async () => {
    const { result, invalidate } = await setup(() => useSetRsvpEventMutation());
    await act(async () => {
      await result.current.mutateAsync({ eventId: 'e1', rsvp: { going: true } });
    });
    expect(setRsvpEvent).toHaveBeenCalledWith('e1', { going: true });
    expect(invalidate).toHaveBeenCalledWith(EVENTS_COUNTS_KEY);
  });

  it('withdrawing an RSVP refreshes the badges', async () => {
    useStore.setState({ event: { id: 'e1', numberOfPersonsGoingToEvent: 3 } as any });
    const { result, invalidate } = await setup(() => useCancelRsvpMutation());
    await act(async () => {
      await result.current.mutateAsync({ eventId: 'e1' });
    });
    expect(cancelRsvp).toHaveBeenCalledWith('e1');
    expect(invalidate).toHaveBeenCalledWith(EVENTS_COUNTS_KEY);
  });
});
