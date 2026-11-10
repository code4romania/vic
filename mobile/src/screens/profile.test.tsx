import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Settings from './Settings';
import Volunteer from './Volunteer';
import useStore from '../store/store';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockLogout = jest.fn();
const mockSwitch = jest.fn();
let mockStats: any;
let mockPersonal: any;
const mockRefetchPersonal = jest.fn();

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ logout: mockLogout }) }));
jest.mock('../services/organization/organization.service', () => ({
  useSwitchOrganizationMutation: () => ({ mutate: mockSwitch }),
}));
jest.mock('../services/volunteer/volunteer.service', () => ({
  useVolunteerStats: () => ({ data: mockStats, refetch: jest.fn() }),
}));
jest.mock('../services/statistics/statistics.service', () => ({
  usePersonalStatistics: () => ({ data: mockPersonal, refetch: mockRefetchPersonal }),
}));
jest.mock('../services/user/user.service', () => ({
  useGetUserProfileQuery: () => ({ refetch: jest.fn() }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const stub = (name: string) => () => <Text>{`page:${name}`}</Text>;

const renderApp = (initialRouteName = 'profile') =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="profile" component={Settings} />
          <Screen name="volunteer" component={Volunteer} />
          {[
            'search',
            'account-data',
            'notifications-settings',
            'delete-account',
            'organization-profile',
            'activity-logs',
            'documents',
            'volunteer-profile',
            'leave-organization',
          ].map((name) => (
            <Screen key={name} name={name} component={stub(name)} />
          ))}
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const org = (id: string, name: string, volunteerProfileId: string | null = 'p1') => ({
  id,
  name,
  logo: '',
  volunteerId: `v-${id}`,
  volunteerProfileId,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPersonal = undefined;
  mockStats = {
    volunteerId: 'v-org-1',
    activityLogCount: 1,
    contractCount: 2,
    volunteerProfileId: 'p1',
  };
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      lastName: 'Popescu',
      email: 'ana@example.com',
      location: { id: 1, name: 'București', county: { id: 1, name: 'București' } },
      activeOrganization: org('org-1', 'Asociația Exemplu'),
      myOrganizations: [org('org-1', 'Asociația Exemplu'), org('org-2', 'Verde Mare', null)],
    } as any,
  });
});

describe('Profil', () => {
  it('shows who you are, your organizations with the active one, and the settings', async () => {
    await renderApp();
    expect(await screen.findByText('Ana')).toBeTruthy();
    expect(screen.getByText('ana@example.com · București')).toBeTruthy();
    const active = screen.getByTestId('profile-organization-org-1');
    expect(within(active).getByText('Activă')).toBeTruthy();
    const other = screen.getByTestId('profile-organization-org-2');
    expect(within(other).queryByText('Activă')).toBeNull();
    expect(within(other).getByText('Profil de voluntar incomplet')).toBeTruthy();
    expect(screen.getByText('Date personale')).toBeTruthy();
    expect(screen.getByText('Notificări')).toBeTruthy();
    expect(screen.getByText('Alătură-te unei organizații')).toBeTruthy();
  });

  it('shows approved hours, events and years in VIC, and refreshes them on focus', async () => {
    mockPersonal = { approvedHours: 145, events: 18, memberSince: '2024-03-01', yearsInVic: 2 };
    await renderApp();
    expect(within(await screen.findByTestId('profile-stat-hours')).getByText('145')).toBeTruthy();
    expect(within(screen.getByTestId('profile-stat-events')).getByText('18')).toBeTruthy();
    expect(within(screen.getByTestId('profile-stat-years')).getByText('2 ani')).toBeTruthy();
    expect(mockRefetchPersonal).toHaveBeenCalled();
  });

  it('says "<1 an" in the first year, "20 de ani" later, and a dash while loading', async () => {
    mockPersonal = { approvedHours: 0, events: 0, memberSince: '2026-10-01', yearsInVic: 0 };
    await renderApp();
    expect(within(await screen.findByTestId('profile-stat-years')).getByText('<1 an')).toBeTruthy();
    mockPersonal = { approvedHours: 0, events: 0, memberSince: '2006-10-01', yearsInVic: 20 };
    await renderApp();
    expect(
      within(await screen.findByTestId('profile-stat-years')).getByText('20 de ani'),
    ).toBeTruthy();
    mockPersonal = undefined;
    await renderApp();
    expect(within(await screen.findByTestId('profile-stat-hours')).getByText('–')).toBeTruthy();
  });

  it('opening another organization makes it active, like the old drawer did', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('profile-organization-org-2'));
    expect(mockSwitch).toHaveBeenCalledWith({ organizationId: 'org-2' });
    expect(useStore.getState().userProfile?.activeOrganization?.id).toBe('org-2');
  });

  it('opening the active organization does not switch again', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('profile-organization-org-1'));
    expect(mockSwitch).not.toHaveBeenCalled();
    expect(await screen.findByText('Profil voluntar')).toBeTruthy();
  });

  it('log out asks first, then signs out', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('profile-logout'));
    expect(mockLogout).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('logout-confirm'));
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('Profil în organizație', () => {
  it('shows pending hours and documents and the organization links', async () => {
    await renderApp('volunteer');
    expect(await screen.findByText('Asociația Exemplu')).toBeTruthy();
    expect(within(screen.getByTestId('volunteer-stat-logs')).getByText('1')).toBeTruthy();
    expect(within(screen.getByTestId('volunteer-stat-documents')).getByText('2')).toBeTruthy();
    expect(screen.getByText('1 cerere așteaptă aprobare')).toBeTruthy();
    expect(screen.queryByTestId('volunteer-profile-prompt')).toBeNull();
    await fireEvent.press(screen.getByTestId('volunteer-leave'));
    expect(await screen.findByText('page:leave-organization')).toBeTruthy();
  });

  it('asks to complete the volunteer profile when it is missing', async () => {
    mockStats = { ...mockStats, volunteerProfileId: null };
    await renderApp('volunteer');
    expect(await screen.findByText('Completează profilul de voluntar')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('volunteer-profile-complete'));
    expect(await screen.findByText('page:volunteer-profile')).toBeTruthy();
  });

  it('without organizations offers to join one', async () => {
    useStore.setState({
      userProfile: { firstName: 'Ana', activeOrganization: null, myOrganizations: [] } as any,
    });
    await renderApp('volunteer');
    await fireEvent.press(await screen.findByText('Alătură-te unei organizații'));
    expect(await screen.findByText('page:search')).toBeTruthy();
  });
});
