import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Events from './Events';
import Event from './Event';
import useStore from '../store/store';
import { EventType } from '../common/enums/event-type.enum';
import { EventVolunteerStatus } from '../common/enums/event-volunteer-status.enum';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { toEventQueryFilters } from '../components/events/event-filters';

const mockActivate = jest.fn(async () => undefined);
jest.mock('../services/organization/organization.service', () => ({
  useActivateOrganization: () => ({ activate: mockActivate }),
}));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockCalls: any[][] = [];
const mockCountCalls: any[][] = [];
const mockRefetchCounts = jest.fn();
let mockCounts: any = { open: 3, going: 2, organizations: 0 };
const mockSetRsvp = jest.fn();
const mockRefetchEvent = jest.fn();
let mockEventError: any = null;

const event = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: `Eveniment ${id}`,
  location: 'Pădurea Băneasa',
  isPublic: true,
  startDate: '2026-11-22T07:00:00.000Z',
  endDate: '2026-11-22T12:00:00.000Z',
  eventInterval: '',
  capacity: 50,
  displayStatus: 'published',
  organizationName: 'Asociația Exemplu',
  ...extra,
});

jest.mock('../services/event/event.service', () => ({
  // answers by tab and filters, and remembers every call
  useEventsInfiniteQuery: (...args: any[]) => {
    mockCalls.push(args);
    const [, search, eventFilter, filters] = args;
    let items: any[] = [];
    if (eventFilter === 'OPEN') {
      items = [event('1'), event('2', { isPublic: false }), event('3')];
    }
    if (eventFilter === 'GOING') {
      items = [event('4'), event('5', { registrationStatus: 'pending' })];
    }
    if (search === 'nimic' || filters?.organizationId === 'org-2') {
      items = [];
    }
    return {
      data: { pages: [{ items, meta: { totalItems: items.length } }] },
      error: null,
      isFetching: false,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    };
  },
  // the segment badges: remembers the search and filters they were asked for
  useEventsCountsQuery: (...args: any[]) => {
    mockCountCalls.push(args);
    const [search, filters] = args;
    const empty = search === 'nimic' || filters?.organizationId === 'org-2';
    return {
      data: mockCounts && (empty ? { open: 0, going: 0, organizations: 0 } : mockCounts),
      refetch: mockRefetchCounts,
    };
  },
  useEventQuery: () => ({ isFetching: false, error: mockEventError, refetch: mockRefetchEvent }),
  useSetRsvpEventMutation: () => ({ mutate: mockSetRsvp, isLoading: false }),
  useCancelRsvpMutation: () => ({ mutate: jest.fn(), isLoading: false }),
}));

const { Navigator, Screen } = createNativeStackNavigator();

const renderApp = (initialRouteName = 'events', params?: Record<string, unknown>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="events" component={Events} />
          <Screen name="event" component={Event} initialParams={params} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  mockEventError = null;
  mockCalls.length = 0;
  mockCountCalls.length = 0;
  mockCounts = { open: 3, going: 2, organizations: 0 };
  jest.clearAllMocks();
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      myOrganizations: [
        {
          id: 'org-1',
          name: 'Asociația Exemplu',
          logo: '',
          volunteerId: 'v1',
          volunteerProfileId: 'p1',
        },
        { id: 'org-2', name: 'Verde Mare', logo: '', volunteerId: 'v2', volunteerProfileId: 'p2' },
      ],
    } as any,
    event: undefined,
  });
});

const lastCall = () => mockCalls[mockCalls.length - 1];

describe('Evenimente', () => {
  it('shows only the search title in the pill when no filters are active', async () => {
    await renderApp();
    const pill = await screen.findByTestId('events-search-pill');
    expect(within(pill).getByText('Caută evenimente')).toBeTruthy();
    expect(screen.queryByText('Oricând · toate organizațiile')).toBeNull();
    expect(pill.props.accessibilityLabel).toBe('Caută evenimente');
  });

  it('opens on "Deschise" and lists events with date, place and organizer', async () => {
    await renderApp();
    expect(await screen.findByText('Eveniment 1')).toBeTruthy();
    expect(lastCall()[2]).toBe(EventType.OPEN);
    const card = screen.getByTestId('event-card-1');
    expect(within(card).getByText('22')).toBeTruthy();
    expect(within(card).getByText('DUM')).toBeTruthy();
    expect(within(card).getByText(/Pădurea Băneasa/)).toBeTruthy();
    expect(within(card).getByText('Asociația Exemplu')).toBeTruthy();
    expect(within(card).getByText('Public')).toBeTruthy();
    expect(within(screen.getByTestId('event-card-2')).getByText('Doar membri')).toBeTruthy();
    expect(within(screen.getByTestId('event-card-2')).queryByText('Public')).toBeNull();
    expect(screen.queryByText('Înscris')).toBeNull();
    // the segment on screen shows how many events it has
    expect(within(screen.getByTestId('events-tabs-OPEN')).getByText('3')).toBeTruthy();
  });

  it('every segment shows its count, from the counts endpoint', async () => {
    await renderApp();
    await screen.findByText('Eveniment 1');
    expect(within(screen.getByTestId('events-tabs-OPEN')).getByText('3')).toBeTruthy();
    expect(within(screen.getByTestId('events-tabs-GOING')).getByText('2')).toBeTruthy();
    expect(within(screen.getByTestId('events-tabs-ORGANIZATIONS')).getByText('0')).toBeTruthy();
    expect(screen.getByTestId('events-tabs-GOING').props.accessibilityLabel).toBe('Particip, 2');
    // asked with the list's search and filters
    expect(mockCountCalls[mockCountCalls.length - 1]).toEqual(['', {}]);
  });

  it('until the counts arrive, only the segment on screen shows its list total', async () => {
    mockCounts = undefined;
    await renderApp();
    await screen.findByText('Eveniment 1');
    expect(within(screen.getByTestId('events-tabs-OPEN')).getByText('3')).toBeTruthy();
    expect(within(screen.getByTestId('events-tabs-GOING')).queryByText('2')).toBeNull();
  });

  it('the counts follow the filters and refresh on pull, focus and RSVP changes', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('events-filter-button'));
    await fireEvent.press(screen.getByTestId('filter-organization-org-2'));
    expect(mockCountCalls[mockCountCalls.length - 1][1]).toEqual({ organizationId: 'org-2' });
    expect(within(screen.getByTestId('events-tabs-GOING')).getByText('0')).toBeTruthy();

    mockRefetchCounts.mockClear();
    // an RSVP on the event page updates the store's event
    await act(async () => {
      useStore.setState({ event: { ...event('1'), description: 'x' } as any });
    });
    expect(mockRefetchCounts).toHaveBeenCalled();

    mockRefetchCounts.mockClear();
    await act(async () => {
      screen.getByTestId('events-list').props.refreshControl.props.onRefresh();
    });
    expect(mockRefetchCounts).toHaveBeenCalled();
  });

  it('"Particip" lists the events you go to, marked "Înscris"', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByText('Particip'));
    // the old list fades out first, then the new one comes in
    expect(await screen.findByText('Eveniment 4')).toBeTruthy();
    expect(lastCall()[2]).toBe(EventType.GOING);
    expect(screen.queryByText('Eveniment 1')).toBeNull();
    expect(within(screen.getByTestId('event-card-4')).getByText('Înscris')).toBeTruthy();
    // the organization hasn't approved this one yet
    const pending = screen.getByTestId('event-card-5');
    expect(within(pending).getByText('În așteptare')).toBeTruthy();
    expect(within(pending).queryByText('Înscris')).toBeNull();
  });

  it('"Organizațiile mele" with nothing published shows its empty state', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByText('Organizațiile mele'));
    expect(await screen.findByText('Organizațiile tale nu au evenimente acum')).toBeTruthy();
  });

  it('search: live count on the button, then the filters reach the query and the badge', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('events-search-pill'));
    expect(await screen.findByText('Ce vrei să faci?')).toBeTruthy();
    expect(screen.getByText('Arată 3 evenimente')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('search-section-when'));
    await fireEvent.press(await screen.findByTestId('when-week'));
    await fireEvent.press(screen.getByTestId('search-section-organization'));
    await fireEvent.press(await screen.findByTestId('organization-org-1'));
    await fireEvent.press(screen.getByTestId('search-apply'));

    const filters = lastCall()[3];
    expect(filters.organizationId).toBe('org-1');
    expect(filters.startFrom).toBeDefined();
    expect(filters.startTo).toBeDefined();
    expect(screen.getByTestId('events-filter-count')).toBeTruthy();
    expect(within(screen.getByTestId('events-filter-count')).getByText('2')).toBeTruthy();
    const pill = screen.getByTestId('events-search-pill');
    expect(within(pill).getByText('Săptămâna asta · Asociația Exemplu')).toBeTruthy();
    expect(pill.props.accessibilityLabel).toBe(
      'Caută evenimente. Săptămâna asta · Asociația Exemplu',
    );
  });

  it('no results: says so and "Șterge tot" brings the list back', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('events-search-pill'));
    await fireEvent.press(screen.getByTestId('search-section-organization'));
    await fireEvent.press(await screen.findByTestId('organization-org-2'));
    expect(screen.getByText('Arată 0 evenimente')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('search-apply'));

    expect(await screen.findByText('Niciun eveniment pentru filtrele alese')).toBeTruthy();
    await fireEvent.press(screen.getByText('Șterge tot'));
    expect(await screen.findByText('Eveniment 1')).toBeTruthy();
    expect(screen.queryByTestId('events-filter-count')).toBeNull();
  });

  it('filters sheet: a choice applies at once, the badge counts it and "Șterge tot" clears it', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('events-filter-button'));
    await fireEvent.press(screen.getByTestId('filter-when-month'));
    let filters = lastCall()[3];
    expect(filters.startFrom).toBeDefined();
    expect(filters.organizationId).toBeUndefined();
    expect(within(screen.getByTestId('events-filter-count')).getByText('1')).toBeTruthy();
    expect(screen.getByTestId('events-filter-button').props.accessibilityLabel).toBe(
      'Filtre, 1 activ',
    );
    expect(within(screen.getByTestId('events-search-pill')).getByText('Luna asta')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('filter-organization-org-1'));
    filters = lastCall()[3];
    expect(filters.organizationId).toBe('org-1');
    expect(within(screen.getByTestId('events-filter-count')).getByText('2')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('filter-organization-all'));
    await fireEvent.press(screen.getByTestId('filter-when-any'));
    expect(lastCall()[3]).toEqual({});
    expect(screen.queryByTestId('events-filter-count')).toBeNull();
  });

  it('opens the event page from a card, with a light haptic', async () => {
    const Haptics = require('expo-haptics');
    await renderApp();
    useStore.setState({ event: { ...event('1'), description: 'Despre eveniment' } as any });
    await fireEvent.press(await screen.findByTestId('event-card-1'));
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(await screen.findByText('Despre eveniment')).toBeTruthy();
  });
});

describe('Eveniment', () => {
  const setEvent = (extra: Record<string, unknown> = {}) =>
    useStore.setState({
      event: {
        ...event('9'),
        description: 'Ne întâlnim la intrare.',
        volunteerStatus: EventVolunteerStatus.NO_RESPONSE,
        numberOfPersonsGoingToEvent: 42,
        ...extra,
      } as any,
    });

  it('shows organizer, when, where, places and the description', async () => {
    setEvent();
    await renderApp('event', { eventId: '9' });
    expect(await screen.findByText('Eveniment 9')).toBeTruthy();
    expect(screen.getByLabelText('Organizat de Asociația Exemplu')).toBeTruthy();
    expect(
      within(screen.getByTestId('event-organizer')).getByText('Asociația Exemplu'),
    ).toBeTruthy();
    expect(screen.getByText('50 de locuri')).toBeTruthy();
    expect(screen.getByText('Deschide în Hărți')).toBeTruthy();
    expect(screen.getByText('Ne întâlnim la intrare.')).toBeTruthy();
    expect(screen.getAllByText(/42 de persoane participă/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('event-going')).toBeTruthy();
    // the glass bar: who the event is open to, and the two answers
    expect(within(screen.getByTestId('event-bar')).getByText('Deschis tuturor')).toBeTruthy();
    expect(screen.getByTestId('event-not-going')).toBeTruthy();
    expect(screen.getByText('Eveniment public')).toBeTruthy();
  });

  it('"Particip" registers and asks for the registration status', async () => {
    setEvent();
    mockSetRsvp.mockImplementation((_payload, { onSuccess }) => onSuccess());
    await renderApp('event', { eventId: '9' });
    await act(async () => {
      await fireEvent.press(await screen.findByTestId('event-going'));
    });
    expect(mockSetRsvp).toHaveBeenCalledWith(
      { eventId: '9', rsvp: { going: true } },
      expect.anything(),
    );
    expect(mockRefetchEvent).toHaveBeenCalled();
  });

  it('a joined event offers "Retrage răspuns" and shows the pending registration', async () => {
    setEvent({
      volunteerStatus: EventVolunteerStatus.JOINED,
      registrationStatus: EventRegistrationStatus.PENDING,
    });
    await renderApp('event', { eventId: '9' });
    expect(await screen.findByTestId('event-cancel')).toBeTruthy();
    expect(screen.getAllByText('Așteaptă aprobarea organizației').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('event-going')).toBeNull();
  });

  const rsvpFails = (code_error?: string) =>
    mockSetRsvp.mockImplementation((_payload, { onError }) =>
      onError(
        code_error
          ? { response: { status: 400, data: { code_error } } }
          : new Error('Network Error'),
      ),
    );

  it('a refused "Particip" shows the real reason, not the profile sheet (audit #10)', async () => {
    const Toast = require('react-native-toast-message').default;
    setEvent({ organizationId: 'org-1' });
    rsvpFails('EVENT_RSVP_007');
    await renderApp('event', { eventId: '9' });
    await act(async () => {
      await fireEvent.press(await screen.findByTestId('event-going'));
    });
    expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text1: 'Evenimentul este încheiat' });
  });

  it('offline "Particip" says so', async () => {
    const Toast = require('react-native-toast-message').default;
    setEvent({ organizationId: 'org-1' });
    rsvpFails();
    await renderApp('event', { eventId: '9' });
    await act(async () => {
      await fireEvent.press(await screen.findByTestId('event-going'));
    });
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: expect.stringMatching(/conexiune/) }),
    );
  });

  it('a missing volunteer profile (EVENT_RSVP_005) offers to complete it at the event organization', async () => {
    // matched by id, even when the name differs
    setEvent({ organizationId: 'org-2', organizationName: 'Alt nume' });
    rsvpFails('EVENT_RSVP_005');
    await renderApp('event', { eventId: '9' });
    await act(async () => {
      await fireEvent.press(await screen.findByTestId('event-going'));
    });
    await act(async () => {
      await fireEvent.press(await screen.findByTestId('event-complete-profile'));
    });
    expect(mockActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'org-2' }));
  });

  it('counts 101 people without "de"', async () => {
    setEvent({ numberOfPersonsGoingToEvent: 101 });
    await renderApp('event', { eventId: '9' });
    expect((await screen.findAllByText(/^101 persoane participă/)).length).toBeGreaterThan(0);
  });

  it('a deleted event shows that it no longer exists', async () => {
    mockEventError = { response: { status: 404, data: { code_error: 'EVENT_001' } } };
    await renderApp('event', { eventId: '9' });
    expect(await screen.findByTestId('state-action')).toBeTruthy();
    expect(screen.getByTestId('state-icon-missing')).toBeTruthy();
  });

  it('a finished event has no registration bar', async () => {
    setEvent({ displayStatus: 'finished' });
    await renderApp('event', { eventId: '9' });
    await screen.findByText('Eveniment 9');
    expect(screen.queryByTestId('event-going')).toBeNull();
  });
});

describe('event filters', () => {
  const now = new Date('2026-11-11T10:00:00'); // Wednesday

  it('"Săptămâna asta" runs from today to Sunday, "Luna asta" to the end of the month', () => {
    const week = toEventQueryFilters({ search: '', when: 'week' }, now);
    expect(new Date(week.startFrom!).getDate()).toBe(11);
    expect(new Date(week.startTo!).getDate()).toBe(15);
    const month = toEventQueryFilters({ search: '', when: 'month' }, now);
    expect(new Date(month.startTo!).getDate()).toBe(30);
  });

  it('sends nothing for "Oricând" and all organizations', () => {
    expect(toEventQueryFilters({ search: 'x', when: 'any' }, now)).toEqual({});
  });
});
