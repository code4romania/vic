import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Home from './Home';
import useStore from '../store/store';
import { EventType } from '../common/enums/event-type.enum';
import { NewsType } from '../common/enums/news-type.enum';

const mockEventCalls: any[][] = [];
let mockGoing: any[] = [];
let mockCounters: any = { approved: 42, pending: 5, rejected: 1 };
let mockStats: any;
const mockCounterCalls: any[] = [];
const mockRefetch = jest.fn();
const mockRefetchProfile = jest.fn();
const mockSwitch = jest.fn();
let mockUnread = 0;
const mockRefetchUnread = jest.fn();

const query = (data: unknown) => ({
  data,
  error: null,
  isFetching: false,
  isRefetching: false,
  refetch: mockRefetch,
});

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('../services/statistics/statistics.service', () => ({
  useMonthlyStatistics: () => query(mockStats),
}));
jest.mock('../services/activity-log/activity-log.service', () => ({
  useActivityLogsCounters: (volunteerId: string | undefined) => {
    mockCounterCalls.push(volunteerId);
    return query(volunteerId ? mockCounters : undefined);
  },
}));
jest.mock('../services/organization/organization.service', () => ({
  // the real hook waits for the backend; here the switch resolves at once
  useActivateOrganization: () => ({
    activate: async (organization: any) => {
      require('../store/store').default.getState().setActiveOrganization(organization);
      await mockSwitch(organization.id);
    },
  }),
}));
jest.mock('../services/anouncement/anouncement.service', () => ({
  useAnouncementsSnapshot: () =>
    query({
      items: [
        {
          id: 'a1',
          title: 'Căutăm 50 de voluntari',
          description: 'Pentru Ziua Pământului',
          organizationLogo: '',
          organization: { name: 'Asociația Exemplu pentru Comunitate' },
        },
      ],
    }),
}));
jest.mock('../services/event/event.service', () => ({
  useEventsInfiniteQuery: (...args: any[]) => {
    mockEventCalls.push(args);
    return query({ pages: [{ items: mockGoing, meta: { totalItems: mockGoing.length } }] });
  },
}));
jest.mock('../services/news/news.service', () => ({
  useUnreadNewsCountQuery: () => ({ data: mockUnread, refetch: mockRefetchUnread }),
}));
jest.mock('../services/user/user.api', () => ({ getUserProfile: jest.fn() }));
jest.mock('../services/user/user.service', () => ({
  useGetUserProfileQuery: () => ({ refetch: mockRefetchProfile }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Stub = ({ route }: any) => (
  <Text>{`page:${route.name}${route.params?.type ? `:${route.params.type}` : ''}`}</Text>
);

const renderHome = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName="dashboard" screenOptions={{ headerShown: false }}>
          <Screen name="dashboard" component={Home} />
          {[
            'events',
            'hours',
            'docs',
            'profile',
            'news',
            'search',
            'event',
            'announcements',
            'volunteer-profile',
            'add-activity-log',
          ].map((name) => (
            <Screen key={name} name={name} component={Stub} />
          ))}
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const setProfile = (activeOrganization: any) =>
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      lastName: 'Popescu',
      activeOrganization,
      myOrganizations: activeOrganization ? [activeOrganization] : [],
    } as any,
  });

const org = (volunteerProfileId: string | null = 'p1') => ({
  id: 'org-1',
  name: 'Asociația Exemplu',
  logo: '',
  volunteerId: 'v1',
  volunteerProfileId,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEventCalls.length = 0;
  mockCounterCalls.length = 0;
  mockUnread = 0;
  mockGoing = [];
  mockCounters = { approved: 42, pending: 5, rejected: 1 };
  mockStats = {
    numberOfUpcomingEvents: 4,
    numberOfActivityLogUpdates: 2,
    numberOfDocumentUpdates: 1,
    numberOfOrganizationUpdates: 3,
  };
  setProfile(org());
});

describe('Acasă', () => {
  it('shows the organization, the news bell and the greeting, with a compact „Acasă” bar', async () => {
    await renderHome();
    const content = within(screen.getByTestId('home'));
    expect(content.getByTestId('home-org')).toBeTruthy();
    expect(content.getByText('Asociația Exemplu')).toBeTruthy();
    expect(content.getByText('Organizația ta')).toBeTruthy();
    expect(content.getByTestId('home-news')).toBeTruthy();
    expect(content.getByRole('header', { name: 'Bună, Ana' })).toBeTruthy();
    // the compact bar sits outside the scroll content and stays out of the accessibility tree
    expect(content.queryByTestId('home-compact-bar', { includeHiddenElements: true })).toBeNull();
    expect(screen.queryByTestId('home-compact-bar')).toBeNull();
    expect(
      within(screen.getByTestId('home-compact-bar', { includeHiddenElements: true })).getByText(
        'Acasă',
        { includeHiddenElements: true },
      ),
    ).toBeTruthy();
  });

  it('leaves organization names and announcement titles unclamped, with only a body preview', async () => {
    await renderHome();
    expect(
      within(screen.getByTestId('home-org')).getByText('Asociația Exemplu').props.numberOfLines,
    ).toBeUndefined();
    const announcement = within(screen.getByTestId('home-anouncement-a1'));
    expect(announcement.getByText('Căutăm 50 de voluntari').props.numberOfLines).toBeUndefined();
    expect(
      announcement.getByText('Asociația Exemplu pentru Comunitate').props.numberOfLines,
    ).toBeUndefined();
    expect(announcement.getByText('Pentru Ziua Pământului').props.numberOfLines).toBe(2);
  });

  it('the bell has no badge when everything is read', async () => {
    mockUnread = 0;
    await renderHome();
    expect(screen.getByTestId('home-news').props.accessibilityLabel).toBe('Noutăți');
    expect(screen.queryByTestId('home-news-badge', { includeHiddenElements: true })).toBeNull();
    // the count is fetched again each time Acasă gets the focus
    expect(mockRefetchUnread).toHaveBeenCalled();
  });

  it('the bell shows the unread news in a red badge, „9+” above 9', async () => {
    for (const [count, label, badge] of [
      [3, 'Noutăți, 3 necitite', '3'],
      [1, 'Noutăți, 1 necitită', '1'],
      [14, 'Noutăți, 14 necitite', '9+'],
    ] as const) {
      mockUnread = count;
      const view = await renderHome();
      expect(screen.getByTestId('home-news').props.accessibilityLabel).toBe(label);
      expect(
        within(screen.getByTestId('home-news-badge', { includeHiddenElements: true })).getByText(
          badge,
          { includeHiddenElements: true },
        ),
      ).toBeTruthy();
      await view.unmount();
    }
  });

  it('opens logged hours news from the bell', async () => {
    await renderHome();
    await fireEvent.press(screen.getByTestId('home-news'));
    expect(await screen.findByText(`page:news:${NewsType.LOGGED_HOURS}`)).toBeTruthy();
  });

  it('shows your impact: approved hours in the hexagon, pending and rejected chips', async () => {
    await renderHome();
    expect(mockCounterCalls[0]).toBe('v1');
    const card = screen.getByTestId('home-impact');
    expect(card.props.accessibilityLabel).toBe(
      '42 de ore aprobate, 5 în așteptare, 1 respinsă. Deschide Ore',
    );
    expect(within(card).getByText('Impactul tău')).toBeTruthy();
    expect(within(card).getByText('ore aprobate')).toBeTruthy();
    expect(within(card).getByText('5h în așteptare')).toBeTruthy();
    expect(within(card).getByText('1h respinsă')).toBeTruthy();
    await fireEvent.press(card);
    expect(await screen.findByText('page:hours')).toBeTruthy();
  });

  it('the impact number counts up to the approved hours', async () => {
    await renderHome();
    await waitFor(() =>
      expect(screen.getByTestId('home-impact-count')).toHaveTextContent('42\u2009h'),
    );
  });

  it('hides the pending and rejected chips when there are none', async () => {
    mockCounters = { approved: 3, pending: 0, rejected: 0 };
    await renderHome();
    const card = screen.getByTestId('home-impact');
    expect(card.props.accessibilityLabel).toBe('3 ore aprobate. Deschide Ore');
    expect(within(card).queryByText(/în așteptare/)).toBeNull();
    expect(within(card).queryByText(/respins/)).toBeNull();
  });

  it('switches the organization from the row when you have more than one', async () => {
    const other = { ...org(), id: 'org-2', name: 'Fundația Doi', volunteerId: 'v2' };
    useStore.setState({
      userProfile: {
        firstName: 'Ana',
        lastName: 'Popescu',
        activeOrganization: org(),
        myOrganizations: [org(), other],
      } as any,
    });
    await renderHome();
    expect(screen.getByTestId('home-org').props.accessibilityState?.disabled).toBeFalsy();
    await fireEvent.press(screen.getByTestId('home-org'));
    await fireEvent.press(await screen.findByTestId('home-org-org-2'));
    await waitFor(() => expect(mockSwitch).toHaveBeenCalledWith('org-2'));
    expect(useStore.getState().userProfile?.activeOrganization?.id).toBe('org-2');
  });

  it('with one organization the row does not offer a switch', async () => {
    await renderHome();
    expect(screen.getByTestId('home-org').props.accessibilityState?.disabled).toBe(true);
    expect(screen.queryByTestId('home-org-sheet')).toBeNull();
  });

  it('refetches the profile on focus', async () => {
    await renderHome();
    expect(mockRefetchProfile).toHaveBeenCalledTimes(1);
  });

  it('greets the volunteer and shows this month and the announcements', async () => {
    await renderHome();
    expect(await screen.findByText('Bună, Ana')).toBeTruthy();
    expect(within(screen.getByTestId('home-stat-events')).getByText('4')).toBeTruthy();
    expect(within(screen.getByTestId('home-stat-hours')).getByText('2')).toBeTruthy();
    expect(screen.getByText('Căutăm 50 de voluntari')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('home-stat-documents'));
    expect(await screen.findByText(`page:news:${NewsType.CONTRACTS}`)).toBeTruthy();
  });

  it('"Luna aceasta" shows a zero as a ghost tile you cannot open', async () => {
    mockStats = { ...mockStats, numberOfOrganizationUpdates: 0 };
    await renderHome();
    const ghost = screen.getByTestId('home-stat-organizations');
    expect(ghost.props.accessibilityRole).toBeUndefined();
    expect(ghost.props.accessibilityLabel).toBe('0 actualizări la organizații');
    expect(screen.getByTestId('home-stat-events').props.accessibilityRole).toBe('button');
  });

  it('"Urmează" lists the next events you go to', async () => {
    mockGoing = [
      {
        id: 'e1',
        name: 'Ziua Pământului',
        location: 'Pădurea Băneasa',
        isPublic: true,
        startDate: '2099-11-22T07:00:00.000Z',
        endDate: '2099-11-22T12:00:00.000Z',
        organizationName: 'Asociația Exemplu',
      },
      {
        id: 'old',
        name: 'Eveniment trecut',
        isPublic: true,
        startDate: '2020-01-01T07:00:00.000Z',
        endDate: '2020-01-01T12:00:00.000Z',
      },
    ];
    await renderHome();
    expect(mockEventCalls[0][2]).toBe(EventType.GOING);
    expect(await screen.findByText('Urmează')).toBeTruthy();
    expect(screen.getByText('Ziua Pământului')).toBeTruthy();
    expect(screen.queryByText('Eveniment trecut')).toBeNull();
    const card = within(screen.getByTestId('event-card-e1'));
    // the yellow date block: day of week, day, month
    expect(card.getByText('22')).toBeTruthy();
    expect(card.getByText('NOV')).toBeTruthy();
    expect(card.getByText('Pădurea Băneasa')).toBeTruthy();
    expect(card.getByText('Public')).toBeTruthy();
    expect(card.getByText('Înscris')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(await screen.findByText('page:event')).toBeTruthy();
  });

  it('"De făcut" shows sending hours, and no contracts to sign (#486)', async () => {
    await renderHome();
    expect(await screen.findByText('Trimite orele de voluntariat')).toBeTruthy();
    expect(screen.queryByTestId('home-todo-contracts')).toBeNull();
  });

  it('"De făcut" asks for the volunteer profile before hours', async () => {
    setProfile(org(null));
    await renderHome();
    expect(await screen.findByText('Completează profilul de voluntar')).toBeTruthy();
    expect(screen.queryByText('Trimite orele de voluntariat')).toBeNull();
  });

  it('without an organization offers to find one and hides organization-only parts', async () => {
    setProfile(null);
    await renderHome();
    expect(await screen.findByText('Nu ai adăugat încă nicio organizație')).toBeTruthy();
    expect(screen.queryByTestId('home-impact')).toBeNull();
    expect(screen.queryByTestId('home-org')).toBeNull();
    expect(screen.queryByTestId('home-stat-hours')).toBeNull();
    expect(screen.queryByText('Căutăm 50 de voluntari')).toBeNull();
    await fireEvent.press(screen.getByTestId('home-join'));
    expect(await screen.findByText('page:search')).toBeTruthy();
  });
});
