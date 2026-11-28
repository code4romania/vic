import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import '../common/config/i18n';
import Organizations from './Organizations';
import OrganizationProfile from './OrganizationProfile';
import useStore from '../store/store';
import { OrganizatinVolunteerStatus } from '../common/enums/organization-volunteer-status.enum';
import { t } from '../test/i18n';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockSearches: string[] = [];
const mockCancel = jest.fn();
const mockRejoin = jest.fn();
const mockRefetch = jest.fn(async () => undefined);

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
  useOrganizationQuery: () => ({ isFetching: false, error: null, refetch: mockRefetch }),
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
  it('pins the compact title and count above the scrolling list, with no back button as a tab', async () => {
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
    // a tab of the bar: a tab switch is not a step back
    expect(header.queryByTestId('organizations-back')).toBeNull();
    expect(header.getByRole('header', { name: t('organizations:heading') })).toBeTruthy();
    expect(header.getByText(t('organizations:count', { n: 2 }))).toBeTruthy();
    const list = within(screen.getByTestId('organizations-list'));
    expect(list.queryByRole('header', { name: t('organizations:heading') })).toBeNull();
    expect(list.queryByText(t('organizations:heading'))).toBeNull();
  });

  it('keeps the title without a back stack and preserves the search input after header layout', async () => {
    await renderApp();
    const header = screen.getByTestId('organizations-header');
    expect(within(header).queryByTestId('organizations-back')).toBeNull();
    expect(within(header).getByRole('header', { name: t('organizations:heading') })).toBeTruthy();
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
    expect(await screen.findByText(t('organizations:heading'))).toBeTruthy();
    expect(screen.getByText(t('organizations:count', { n: 2 }))).toBeTruthy();
    const mine = screen.getByTestId('organization-row-org-1');
    expect(
      within(mine).getByText(t('organization_profile:volunteers', { count: 120 })),
    ).toBeTruthy();
    expect(within(mine).getByText(t('organizations:member'))).toBeTruthy();
    expect(
      within(screen.getByTestId('organization-row-org-3')).queryByText(t('organizations:member')),
    ).toBeNull();
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
      expect(await screen.findByText(t('organizations:empty.title'))).toBeTruthy();
      await fireEvent.press(screen.getByTestId('organizations-search-clear'));
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(await screen.findByText('Crucea Albastră')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('counts one organization in the singular', async () => {
    jest.useFakeTimers();
    try {
      await renderApp();
      await fireEvent.changeText(await screen.findByTestId('organizations-search'), 'crucea');
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(await screen.findByText(t('organizations:count_one'))).toBeTruthy();
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
    expect(await screen.findByText(t('organization_profile:about'))).toBeTruthy();
    expect(screen.getByText('contact@exemplu.ro')).toBeTruthy();
    expect(screen.getByText('Str. Lungă 1, București')).toBeTruthy();
    expect(screen.getByText(t('organization_profile:no_events'))).toBeTruthy();
    expect(screen.getByText(t('organization_profile:bar.have_code'))).toBeTruthy();
    expect(screen.getByText(t('organization_profile:bar.join'))).toBeTruthy();
    expect(screen.queryByTestId('organization-leave')).toBeNull();
  });

  it('"Vreau să ajut" without a birthday asks to complete the profile', async () => {
    setOrganization(undefined, null);
    await renderApp('organization-profile');
    await fireEvent.press(await screen.findByTestId('organization-join'));
    expect(
      screen.getByText(t('organization_profile:modal.birthday_missing.action_label')),
    ).toBeTruthy();
  });

  it('a pending request can be withdrawn after confirming', async () => {
    setOrganization(OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING);
    await renderApp('organization-profile');
    expect(
      await screen.findByText(t('organization_profile:disclaimer.access_request_pending')),
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
    expect(member.getByText(t('organization_profile:bar.member'))).toBeTruthy();
    expect(
      member.getByText(t('organization_profile:bar.member_since', { date: '01.03.2025' })),
    ).toBeTruthy();
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
      await screen.findByText(t('organization_profile:disclaimer.volunteer_blocked')),
    ).toBeTruthy();
    expect(screen.queryByTestId('organization-bar')).toBeNull();
  });

  describe('the status changes while the page is open (#691)', () => {
    it('back from the background, the page asks again and shows the approval', async () => {
      const listeners: ((state: AppStateStatus) => void)[] = [];
      const original = AppState.addEventListener;
      AppState.addEventListener = ((type: string, listener: (state: AppStateStatus) => void) => {
        if (type === 'change') {
          listeners.push(listener);
        }
        return { remove: jest.fn() };
      }) as any;
      // the API now answers "member": the query's onSuccess puts it in the store
      mockRefetch.mockImplementation(async () => {
        setOrganization(OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER);
        return undefined;
      });
      setOrganization(OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING);
      await renderApp('organization-profile');
      expect(
        await screen.findByText(t('organization_profile:disclaimer.access_request_pending')),
      ).toBeTruthy();

      await act(async () => listeners.forEach((listener) => listener('background')));
      expect(mockRefetch).not.toHaveBeenCalled();
      await act(async () => listeners.forEach((listener) => listener('active')));

      expect(mockRefetch).toHaveBeenCalled();
      expect(await screen.findByText(t('organization_profile:bar.member'))).toBeTruthy();
      expect(
        screen.queryByText(t('organization_profile:disclaimer.access_request_pending')),
      ).toBeNull();
      AppState.addEventListener = original;
    });

    it('pull to refresh asks for the organization again', async () => {
      setOrganization(OrganizatinVolunteerStatus.ACCESS_REQUEST_PENDING);
      await renderApp('organization-profile');
      const page = await screen.findByTestId('organization-scroll');
      await act(async () => page.props.refreshControl.props.onRefresh());
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});
