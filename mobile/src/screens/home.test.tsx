import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Home from './Home';
import useStore from '../store/store';
import { EventType } from '../common/enums/event-type.enum';
import { NewsType } from '../common/enums/news-type.enum';

const mockEventCalls: any[][] = [];
let mockGoing: any[] = [];
const mockRefetch = jest.fn();
const mockRefetchProfile = jest.fn();

const query = (data: unknown) => ({
  data,
  error: null,
  isFetching: false,
  isRefetching: false,
  refetch: mockRefetch,
});

jest.mock('../services/statistics/statistics.service', () => ({
  useMonthlyStatistics: () =>
    query({
      numberOfUpcomingEvents: 4,
      numberOfActivityLogUpdates: 2,
      numberOfDocumentUpdates: 1,
      numberOfOrganizationUpdates: 3,
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
  mockGoing = [];
  setProfile(org());
});

describe('Acasă', () => {
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
    expect(screen.queryByTestId('home-stat-hours')).toBeNull();
    expect(screen.queryByText('Căutăm 50 de voluntari')).toBeNull();
    await fireEvent.press(screen.getByTestId('home-join'));
    expect(await screen.findByText('page:search')).toBeTruthy();
  });
});
