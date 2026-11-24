import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import i18n from '../common/config/i18n';
import Settings from './Settings';
import Volunteer from './Volunteer';
import useStore from '../store/store';
import { TEST_LANGUAGE, containing, t } from '../test/i18n';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
const mockSetUserLanguage = jest.fn(async (language: string, _explicit: boolean) => ({ language }));
jest.mock('../services/user/user.api', () => ({
  setUserLanguage: (language: string, explicit: boolean) => mockSetUserLanguage(language, explicit),
}));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockLogout = jest.fn();
const mockSwitch = jest.fn();
let mockStats: any;
let mockPersonal: any;
const mockRefetchPersonal = jest.fn();
const mockRefetchProfile = jest.fn();
const mockRefetchStats = jest.fn();

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ logout: mockLogout }) }));
jest.mock('../services/organization/organization.service', () => ({
  // the real hook waits for the backend; here the switch resolves at once
  useActivateOrganization: () => ({
    activate: async (organization: any) => {
      const store = require('../store/store').default;
      if (store.getState().userProfile?.activeOrganization?.id === organization.id) {
        return;
      }
      store.getState().setActiveOrganization(organization);
      await mockSwitch({ organizationId: organization.id });
    },
  }),
}));
jest.mock('../services/volunteer/volunteer.service', () => ({
  useVolunteerStats: () => ({ data: mockStats, refetch: mockRefetchStats }),
}));
jest.mock('../services/statistics/statistics.service', () => ({
  usePersonalStatistics: () => ({ data: mockPersonal, refetch: mockRefetchPersonal }),
}));
jest.mock('../services/user/user.service', () => ({
  useGetUserProfileQuery: () => ({ refetch: mockRefetchProfile }),
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
  it('opens with your hexagon, „Profilul tău” and your first name as the title', async () => {
    await renderApp();
    const header = within(screen.getByTestId('settings-header'));
    expect(header.getByText(t('settings:your_profile'))).toBeTruthy();
    expect(header.getByRole('header', { name: 'Ana' })).toBeTruthy();
    // the yellow hexagon shows the first initial
    expect(header.getByText('A', { includeHiddenElements: true })).toBeTruthy();
  });

  it('keeps delete and log out apart from the other settings', async () => {
    await renderApp();
    expect(screen.getByText(t('settings:section_settings'))).toBeTruthy();
    expect(screen.getByText(t('settings:information'))).toBeTruthy();
    expect(screen.getByTestId('profile-delete')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('profile-delete'));
    expect(await screen.findByText('page:delete-account')).toBeTruthy();
  });

  it('marks an organization that has not accepted you yet as waiting', async () => {
    useStore.setState({
      userProfile: {
        firstName: 'Ana',
        activeOrganization: null,
        myOrganizations: [{ ...org('org-3', 'Cerc Nou'), volunteerStatus: 'candidate' }],
      } as any,
    });
    await renderApp();
    const row = await screen.findByTestId('profile-organization-org-3');
    expect(within(row).getByText(t('settings:waiting'))).toBeTruthy();
  });

  it('refetches the profile on focus', async () => {
    await renderApp();
    expect(mockRefetchProfile).toHaveBeenCalledTimes(1);
  });

  it('shows who you are, your organizations with the active one, and the settings', async () => {
    await renderApp();
    expect(await screen.findByText('Ana')).toBeTruthy();
    expect(screen.getByText('ana@example.com · București')).toBeTruthy();
    const active = screen.getByTestId('profile-organization-org-1');
    expect(within(active).getByText(t('settings:active'))).toBeTruthy();
    const other = screen.getByTestId('profile-organization-org-2');
    expect(within(other).queryByText(t('settings:active'))).toBeNull();
    expect(within(other).getByText(t('settings:volunteer_profile_missing'))).toBeTruthy();
    expect(screen.getByText(t('settings:heading'))).toBeTruthy();
    expect(screen.getByText(t('settings:notification'))).toBeTruthy();
    expect(screen.getByText(t('settings:join_organization'))).toBeTruthy();
  });

  it('shows approved hours, events and years in VIC, and refreshes them on focus', async () => {
    mockPersonal = { approvedHours: 145, events: 18, memberSince: '2024-03-01', yearsInVic: 2 };
    await renderApp();
    expect(within(await screen.findByTestId('profile-stat-hours')).getByText('145')).toBeTruthy();
    expect(within(screen.getByTestId('profile-stat-events')).getByText('18')).toBeTruthy();
    expect(
      within(screen.getByTestId('profile-stat-years')).getByText(
        t('settings:stats.years', { count: 2 }),
      ),
    ).toBeTruthy();
    expect(mockRefetchPersonal).toHaveBeenCalled();
  });

  it('says "<1 an" in the first year, "20 de ani" later, and a dash while loading', async () => {
    mockPersonal = { approvedHours: 0, events: 0, memberSince: '2026-10-01', yearsInVic: 0 };
    await renderApp();
    expect(
      within(await screen.findByTestId('profile-stat-years')).getByText(
        t('settings:stats.years_less'),
      ),
    ).toBeTruthy();
    mockPersonal = { approvedHours: 0, events: 0, memberSince: '2006-10-01', yearsInVic: 20 };
    await renderApp();
    expect(
      within(await screen.findByTestId('profile-stat-years')).getByText(
        t('settings:stats.years_de', { count: 20 }),
      ),
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
    expect(await screen.findByText(t('volunteer:menu_items.volunteer_profile.title'))).toBeTruthy();
  });

  it('„Limba aplicației” sits with the settings and changes the whole screen at once', async () => {
    await renderApp();
    const row = await screen.findByTestId('profile-language');
    expect(row).toHaveTextContent(containing(t('language:title')));

    await fireEvent.press(row);
    const other = TEST_LANGUAGE === 'ro' ? 'en' : 'ro';
    await fireEvent.press(screen.getByTestId(`language-option-${other}`));

    // no restart: the texts already on screen are redrawn in the other language
    const inOther = (key: string) => `${i18n.t(key, { lng: other })}`;
    expect(await screen.findByText(inOther('settings:section_settings'))).toBeTruthy();
    expect(screen.getByText(inOther('settings:your_profile'))).toBeTruthy();
    expect(screen.getByTestId('profile-language')).toHaveTextContent(
      containing(inOther('language:title')),
    );
    expect(inOther('settings:your_profile')).not.toBe(
      t('settings:your_profile', { lng: TEST_LANGUAGE }),
    );
    // and the account gets it as a choice
    await waitFor(() => expect(mockSetUserLanguage).toHaveBeenCalledWith(other, true));
    expect(useStore.getState().userProfile?.language).toBe(other);
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
    expect(
      screen.getByText(t('volunteer:menu_items.activity_log.subtitle.one', { number: 1 })),
    ).toBeTruthy();
    expect(screen.queryByTestId('volunteer-profile-prompt')).toBeNull();
    await fireEvent.press(screen.getByTestId('volunteer-leave'));
    expect(await screen.findByText('page:leave-organization')).toBeTruthy();
  });

  it('asks to complete the volunteer profile when it is missing', async () => {
    mockStats = { ...mockStats, volunteerProfileId: null };
    await renderApp('volunteer');
    expect(await screen.findByText(t('volunteer:prompt.title'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('volunteer-profile-complete'));
    expect(await screen.findByText('page:volunteer-profile')).toBeTruthy();
  });

  it('without organizations offers to join one', async () => {
    useStore.setState({
      userProfile: { firstName: 'Ana', activeOrganization: null, myOrganizations: [] } as any,
    });
    await renderApp('volunteer');
    await fireEvent.press(await screen.findByText(t('volunteer:join_organization')));
    expect(await screen.findByText('page:search')).toBeTruthy();
  });
});
