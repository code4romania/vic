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

jest.mock('../services/organization/organization.service', () => ({
  useSwitchOrganizationMutation: () => ({ mutate: jest.fn() }),
}));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockCalls: any[][] = [];
const mockSetRsvp = jest.fn();
const mockRefetchEvent = jest.fn();

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
      items = [event('4')];
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
  useEventQuery: () => ({ isFetching: false, error: null, refetch: mockRefetchEvent }),
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
  mockCalls.length = 0;
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
  it('opens on "Deschise" and lists events with date, place and organizer', async () => {
    await renderApp();
    expect(await screen.findByText('Eveniment 1')).toBeTruthy();
    expect(lastCall()[2]).toBe(EventType.OPEN);
    const card = screen.getByTestId('event-card-1');
    expect(within(card).getByText('22')).toBeTruthy();
    expect(within(card).getByText(/Pădurea Băneasa/)).toBeTruthy();
    expect(within(card).getByText('Asociația Exemplu · public')).toBeTruthy();
    expect(within(screen.getByTestId('event-card-2')).getByText(/doar membri/)).toBeTruthy();
    expect(screen.queryByText('Înscris')).toBeNull();
  });

  it('"Particip" lists the events you go to, marked "Înscris"', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByText('Particip'));
    expect(lastCall()[2]).toBe(EventType.GOING);
    expect(await screen.findByText('Eveniment 4')).toBeTruthy();
    expect(screen.getByText('Înscris')).toBeTruthy();
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
    expect(screen.getByText('Săptămâna asta · Asociația Exemplu')).toBeTruthy();
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

  it('opens the event page from a card', async () => {
    await renderApp();
    useStore.setState({ event: { ...event('1'), description: 'Despre eveniment' } as any });
    await fireEvent.press(await screen.findByTestId('event-card-1'));
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
    expect(screen.getByText('Organizat de Asociația Exemplu')).toBeTruthy();
    expect(screen.getByText('50 locuri')).toBeTruthy();
    expect(screen.getByText('Deschide în Hărți')).toBeTruthy();
    expect(screen.getByText('Ne întâlnim la intrare.')).toBeTruthy();
    expect(screen.getAllByText(/42 de persoane participă/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('event-going')).toBeTruthy();
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
