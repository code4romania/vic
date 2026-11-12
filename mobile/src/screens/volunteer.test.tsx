import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import '../common/config/i18n';
import Volunteer from './Volunteer';
import useStore from '../store/store';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));
jest.mock('../services/organization/organization.service', () => ({}));

const mockRefetchProfile = jest.fn();
const mockRefetchStats = jest.fn();
jest.mock('../services/volunteer/volunteer.service', () => ({
  useVolunteerStats: () => ({
    data: { activityLogCount: 1, contractCount: 2, volunteerProfileId: 'p1' },
    refetch: mockRefetchStats,
  }),
}));
jest.mock('../services/user/user.service', () => ({
  useGetUserProfileQuery: () => ({ refetch: mockRefetchProfile }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Previous = () => <Text>page:previous</Text>;
const organizationName = 'Asociația Exemplu';

const renderApp = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer
        initialState={{
          index: 1,
          routes: [{ name: 'previous' }, { name: 'volunteer' }],
        }}
      >
        <Navigator screenOptions={{ headerShown: false }}>
          <Screen name="previous" component={Previous} />
          <Screen name="volunteer" component={Volunteer} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  const organization = {
    id: 'org-1',
    name: organizationName,
    logo: '',
    volunteerId: 'v-org-1',
    volunteerProfileId: 'p1',
  };
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      lastName: 'Popescu',
      email: 'ana@example.com',
      location: { id: 1, name: 'București', county: { id: 1, name: 'București' } },
      activeOrganization: organization,
      myOrganizations: [organization],
    } as any,
  });
});

describe('Volunteer pinned bar', () => {
  it('contains the back button and an initially inaccessible compact organization', async () => {
    await renderApp();
    const bar = screen.getByTestId('volunteer-bar-top');
    expect(within(bar).getByTestId('volunteer-back')).toBeTruthy();
    const compactName = within(bar).getByText(organizationName, { includeHiddenElements: true });
    const compactGroup = compactName.parent;
    expect(compactGroup?.props.accessibilityElementsHidden).toBe(true);
    expect(compactGroup?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(within(bar).queryByText(organizationName)).toBeNull();
  });

  it('keeps the large title as the only accessibility header outside the bar', async () => {
    await renderApp();
    const headers = screen.getAllByRole('header');
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent(organizationName);
    expect(within(screen.getByTestId('volunteer')).getByRole('header')).toBe(headers[0]);
    expect(
      within(screen.getByTestId('volunteer-bar-top')).queryByRole('header', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });

  it('returns to the previous screen when the pinned back button is pressed', async () => {
    await renderApp();
    await fireEvent.press(
      within(screen.getByTestId('volunteer-bar-top')).getByTestId('volunteer-back'),
    );
    expect(await screen.findByText('page:previous')).toBeTruthy();
    expect(screen.queryByTestId('volunteer-bar-top')).toBeNull();
  });
});
