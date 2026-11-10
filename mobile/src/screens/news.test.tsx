import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '../common/config/i18n';
import News from './News';
import Anouncements from './Anouncements';
import useStore from '../store/store';
import { NewsType } from '../common/enums/news-type.enum';
import { TrackedEventName } from '../common/enums/tracked-event-name.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';

const mockSwitch = jest.fn();
const mockNewsCalls: NewsType[] = [];

const mockPage = (items: any[]) => ({
  data: { pages: [{ items, meta: { totalItems: items.length } }] },
  error: null,
  isFetching: false,
  isRefetching: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
});

const mockNews: Record<string, any[]> = {
  [NewsType.LOGGED_HOURS]: [
    {
      id: 'n1',
      organizationId: 'org-2',
      organizationName: 'Verde Mare',
      organizationLogo: '',
      eventName: TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS,
      newStatus: ActivityLogStatus.APPROVED,
      activityLogId: 'log-9',
    },
  ],
  [NewsType.ORGANIZATIONS]: [
    {
      id: 'n2',
      organizationId: 'org-3',
      organizationName: 'Crucea Verde',
      organizationLogo: '',
      eventName: TrackedEventName.REJECT_ACCESS_REQUEST,
      accessRequestId: 'ar-1',
    },
  ],
  [NewsType.CONTRACTS]: [],
};

jest.mock('../services/news/news.service', () => ({
  useNewsInfiniteQuery: (type: NewsType) => {
    mockNewsCalls.push(type);
    return mockPage(mockNews[type]);
  },
}));
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
jest.mock('../services/anouncement/anouncement.service', () => ({
  useAnouncementsInfiniteQuery: () =>
    mockPage([
      {
        id: 'a1',
        title: 'Ziua Pământului',
        description: 'Căutăm 50 de voluntari',
        organizationLogo: '',
      },
      {
        id: 'a2',
        title: 'Program nou',
        description: 'De luni',
        organizationLogo: '',
        myResponse: { comment: 'Vin sâmbătă', createdOn: new Date() },
      },
    ]),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Stub = ({ route }: any) => (
  <Text>{`page:${route.name}:${JSON.stringify(route.params ?? {})}`}</Text>
);

const renderApp = (initialRouteName: string, params?: Record<string, unknown>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="news" component={News} initialParams={params} />
          <Screen name="announcements" component={Anouncements} />
          {[
            'activity-log',
            'rejected-request',
            'rejected-contract',
            'documents',
            'organization-profile',
            'anouncement-response',
          ].map((name) => (
            <Screen key={name} name={name} component={Stub} />
          ))}
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockNewsCalls.length = 0;
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      activeOrganization: { id: 'org-1', name: 'Asociația Exemplu', volunteerId: 'v1' },
      myOrganizations: [
        { id: 'org-1', name: 'Asociația Exemplu', volunteerId: 'v1' },
        { id: 'org-2', name: 'Verde Mare', volunteerId: 'v2' },
      ],
    } as any,
  });
});

describe('Noutăți', () => {
  it('opens on the kind it was asked for and switches with the segmented control', async () => {
    await renderApp('news', { type: NewsType.LOGGED_HOURS });
    expect(await screen.findByText('Noutăți')).toBeTruthy();
    expect(screen.getByText(/Orele de voluntariat înregistrate au fost aprobate/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Organizații'));
    expect(mockNewsCalls[mockNewsCalls.length - 1]).toBe(NewsType.ORGANIZATIONS);
    expect(await screen.findByText('Crucea Verde')).toBeTruthy();
    await fireEvent.press(screen.getByText('Documente'));
    expect(await screen.findByText('Nicio noutate aici încă')).toBeTruthy();
  });

  it('an update from another organization makes it active, then opens it', async () => {
    await renderApp('news', { type: NewsType.LOGGED_HOURS });
    await fireEvent.press(await screen.findByTestId('news-row-n1'));
    expect(mockSwitch).toHaveBeenCalledWith({ organizationId: 'org-2' });
    expect(useStore.getState().userProfile?.activeOrganization?.id).toBe('org-2');
    expect(await screen.findByText(/page:activity-log:.*log-9/)).toBeTruthy();
  });

  it('a rejected access request opens the reason', async () => {
    await renderApp('news', { type: NewsType.ORGANIZATIONS });
    await fireEvent.press(await screen.findByTestId('news-row-n2'));
    expect(await screen.findByText(/page:rejected-request:.*ar-1/)).toBeTruthy();
  });
});

describe('Anunțuri', () => {
  it('shows each announcement with your answer or a link to answer', async () => {
    await renderApp('announcements');
    expect(await screen.findByText('Căutăm 50 de voluntari')).toBeTruthy();
    expect(screen.getByText('Vin sâmbătă')).toBeTruthy();
    expect(screen.queryByTestId('anouncement-respond-a2')).toBeNull();
    await fireEvent.press(screen.getByTestId('anouncement-respond-a1'));
    expect(await screen.findByText(/page:anouncement-response:.*a1/)).toBeTruthy();
  });
});
