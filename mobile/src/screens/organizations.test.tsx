import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Organizations from './Organizations';
import OrganizationProfile from './OrganizationProfile';
import useStore from '../store/store';
import { OrganizatinVolunteerStatus } from '../common/enums/organization-volunteer-status.enum';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockSearches: string[] = [];
const mockCancel = jest.fn();
const mockRejoin = jest.fn();

const row = (id: string, name: string, numberOfVolunteers: number) => ({
  id,
  name,
  logo: '',
  numberOfVolunteers,
});

jest.mock('../services/organization/organization.service', () => ({
  useOrganizationsInfiniteQuery: (_order: string, search: string) => {
    mockSearches.push(search);
    const all = [row('org-1', 'Asociația Exemplu', 120), row('org-3', 'Crucea Albastră', 8)];
    const items = all.filter((o) => o.name.toLowerCase().includes((search || '').toLowerCase()));
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
  useOrganizationQuery: () => ({ isFetching: false, error: null }),
  useRejoinOrganizationMutation: () => ({ mutate: mockRejoin, isLoading: false }),
}));
jest.mock('../services/access-request/access-request.service', () => ({
  useCancelAccessRequestMutation: () => ({ mutate: mockCancel, isLoading: false }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Stub = () => null;

const renderApp = (initialRouteName = 'search') =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="search" component={Organizations} />
          <Screen
            name="organization-profile"
            component={OrganizationProfile}
            initialParams={{ organizationId: 'org-1' }}
          />
          <Screen name="join-organization" component={Stub} />
          <Screen name="join-by-access-code" component={Stub} />
          <Screen name="leave-organization" component={Stub} />
          <Screen name="account-data" component={Stub} />
          <Screen name="events" component={Stub} />
          <Screen name="event" component={Stub} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const organization = (status?: OrganizatinVolunteerStatus) => ({
  id: 'org-1',
  name: 'Asociația Exemplu',
  logo: '',
  description: 'Plantăm copaci în fiecare toamnă.',
  email: 'contact@exemplu.ro',
  phone: '0722000000',
  address: 'Str. Lungă 1, București',
  website: 'exemplu.ro',
  numberOfVolunteers: 120,
  events: [],
  organizationVolunteerStatus: status,
  volunteer: { id: 'v1', createdOn: '2025-03-01T10:00:00.000Z' },
});

const setOrganization = (
  status?: OrganizatinVolunteerStatus,
  birthday: string | null = '1990-01-01',
) =>
  useStore.setState({
    organization: organization(status) as any,
    userProfile: {
      firstName: 'Ana',
      birthday,
      myOrganizations: [{ id: 'org-1', name: 'Asociația Exemplu', logo: '' }],
    } as any,
  });

beforeEach(() => {
  mockSearches.length = 0;
  jest.clearAllMocks();
  setOrganization();
});

describe('Organizații', () => {
  it('pins the back button, compact title and count above the scrolling list', async () => {
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <NavigationContainer
          initialState={{ index: 1, routes: [{ name: 'events' }, { name: 'search' }] }}
        >
          <Navigator screenOptions={{ headerShown: false }}>
            <Screen name="events" component={Stub} />
            <Screen name="search" component={Organizations} />
          </Navigator>
        </NavigationContainer>
      </SafeAreaProvider>,
    );
    const header = within(screen.getByTestId('organizations-header'));
    expect(header.getByTestId('organizations-back')).toBeTruthy();
    expect(header.getByRole('header', { name: 'Organizații' })).toBeTruthy();
    expect(header.getByText('2 organizații')).toBeTruthy();
    const list = within(screen.getByTestId('organizations-list'));
    expect(list.queryByRole('header', { name: 'Organizații' })).toBeNull();
    expect(list.queryByText('Organizații')).toBeNull();

    await fireEvent.press(header.getByTestId('organizations-back'));
    expect(screen.queryByTestId('organizations-header')).toBeNull();
  });

  it('keeps the title without a back stack and preserves the search input after header layout', async () => {
    await renderApp();
    const header = screen.getByTestId('organizations-header');
    expect(within(header).queryByTestId('organizations-back')).toBeNull();
    expect(within(header).getByRole('header', { name: 'Organizații' })).toBeTruthy();
    const input = screen.getByTestId('organizations-search');
    await fireEvent.changeText(input, 'Crucea');
    await fireEvent(header, 'layout', { nativeEvent: { layout: { height: 120 } } });
    expect(screen.getByTestId('organizations-search')).toBe(input);
    expect(input.props.value).toBe('Crucea');
    expect(screen.getByTestId('organizations-list').props.contentContainerStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 128 })]),
    );
    expect(
      screen.getByTestId('organizations-list').props.refreshControl.props.progressViewOffset,
    ).toBe(120);
  });

  it('lists organizations with volunteers and marks the ones you belong to', async () => {
    await renderApp();
    expect(await screen.findByText('Organizații')).toBeTruthy();
    expect(screen.getByText('2 organizații')).toBeTruthy();
    const mine = screen.getByTestId('organization-row-org-1');
    expect(within(mine).getByText('120 de voluntari')).toBeTruthy();
    expect(within(mine).getByText('Membru')).toBeTruthy();
    expect(within(screen.getByTestId('organization-row-org-3')).queryByText('Membru')).toBeNull();
  });

  it('searches as you type, can clear, and shows the empty state', async () => {
    jest.useFakeTimers();
    try {
      await renderApp();
      await fireEvent.changeText(await screen.findByTestId('organizations-search'), 'xyz');
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(mockSearches[mockSearches.length - 1]).toBe('xyz');
      expect(await screen.findByText('Nu există rezultate')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('organizations-search-clear'));
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(await screen.findByText('Crucea Albastră')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('opens the organization page from a row', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('organization-row-org-1'));
    expect(await screen.findByText('Plantăm copaci în fiecare toamnă.')).toBeTruthy();
  });
});

describe('Organizație', () => {
  it('pins the back button and compact name while keeping the large title as the header', async () => {
    await renderApp('organization-profile');
    const bar = await screen.findByTestId('organization-bar-top');
    expect(within(bar).getByTestId('organization-back')).toBeTruthy();
    expect(
      within(bar).getByText('Asociația Exemplu', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(within(bar).queryByText('Asociația Exemplu')).toBeNull();
    expect(screen.getByRole('header', { name: 'Asociația Exemplu' })).toBeTruthy();
    expect(
      within(bar).queryByRole('header', { name: 'Asociația Exemplu', includeHiddenElements: true }),
    ).toBeNull();
  });

  it('shows the description, contacts and "Am un cod" + "Vreau să ajut" for a new volunteer', async () => {
    await renderApp('organization-profile');
    expect(await screen.findByText('Despre')).toBeTruthy();
    expect(screen.getByText('contact@exemplu.ro')).toBeTruthy();
    expect(screen.getByText('Str. Lungă 1, București')).toBeTruthy();
    expect(screen.getByText('Nu sunt evenimente de afișat')).toBeTruthy();
    expect(screen.getByText('Am un cod')).toBeTruthy();
    expect(screen.getByText('Vreau să ajut')).toBeTruthy();
    expect(screen.queryByTestId('organization-leave')).toBeNull();
  });

  it('"Vreau să ajut" without a birthday asks to complete the profile', async () => {
    setOrganization(undefined, null);
    await renderApp('organization-profile');
    await fireEvent.press(await screen.findByTestId('organization-join'));
    expect(screen.getByText('Completează datele')).toBeTruthy();
  });

  it('a pending request can be withdrawn after confirming', async () => {
    setOrganization(OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING);
    await renderApp('organization-profile');
    expect(
      await screen.findByText('Înscrierea ta așteaptă aprobare de la organizație'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByTestId('organization-withdraw'));
    await fireEvent.press(screen.getByTestId('organization-cancel-confirm'));
    expect(mockCancel).toHaveBeenCalledWith({ organizationId: 'org-1' }, expect.any(Object));
  });

  it('a member sees "Membru", the join date and can leave', async () => {
    setOrganization(OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER);
    await renderApp('organization-profile');
    const bar = await screen.findByTestId('organization-bar');
    // status and date stacked in one block, next to "Vezi evenimente"
    const member = within(within(bar).getByTestId('organization-member'));
    expect(member.getByText('Membru')).toBeTruthy();
    expect(member.getByText('din 01.03.2025')).toBeTruthy();
    expect(within(bar).getByTestId('organization-events')).toBeTruthy();
    expect(screen.getByTestId('organization-leave')).toBeTruthy();
  });

  it('a former volunteer can ask to rejoin', async () => {
    setOrganization(OrganizatinVolunteerStatus.ARCHIVED_VOLUNTEER);
    await renderApp('organization-profile');
    await fireEvent.press(await screen.findByTestId('organization-rejoin'));
    expect(mockRejoin).toHaveBeenCalledWith({ volunteerId: 'v1' }, expect.any(Object));
  });

  it('a blocked volunteer only sees the banner', async () => {
    setOrganization(OrganizatinVolunteerStatus.BLOCKED_VOLUNTEER);
    await renderApp('organization-profile');
    expect(
      await screen.findByText('Accesul tău la organizație a fost restricționat.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('organization-bar')).toBeNull();
  });
});
