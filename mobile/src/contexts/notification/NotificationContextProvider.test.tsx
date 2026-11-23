import React from 'react';
import { act, render } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import NotificationContextProvider, {
  EVENTS,
  refreshAfterPush,
} from './NotificationContextProvider';
import { queryClient } from '../../services/query-client';

const mockReceived: ((notification: any) => void)[] = [];
const mockRemove = jest.fn();

jest.mock('expo-notifications', () => ({
  useLastNotificationResponse: jest.fn(() => undefined),
  clearLastNotificationResponse: jest.fn(),
  addNotificationReceivedListener: jest.fn((listener: (notification: any) => void) => {
    mockReceived.push(listener);
    return { remove: mockRemove };
  }),
}));
jest.mock('../../common/utils/notifications', () => ({
  registerForPushNotificationsAsync: jest.fn(async () => ({ token: null, userWasAsked: false })),
}));
jest.mock('../../services/settings/settings.api', () => ({ registerPushToken: jest.fn() }));
jest.mock('../../services/settings/settings.service', () => ({
  useUpdateSettingsMutation: () => ({ mutate: jest.fn() }),
}));
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }));

const push = (key: string) => ({ request: { content: { data: { key, payload: {} } } } });
const invalidated = () =>
  (queryClient.invalidateQueries as jest.Mock).mock.calls.map(([key]) => key[0]).sort();

beforeEach(() => {
  mockReceived.length = 0;
  jest.clearAllMocks();
  jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
});

describe('refreshAfterPush (#691)', () => {
  it.each([
    EVENTS.JOIN_NGO.APPROVE_REQUEST,
    EVENTS.JOIN_NGO.REJECT_REQUEST,
    EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER,
  ])('%s: the organization, the list and the profile load again', (key) => {
    refreshAfterPush(key);
    expect(invalidated()).toEqual(['organization', 'organizations', 'user-profile']);
  });

  // #711
  it.each([EVENTS.VOLUNTEER_HOURS.APPROVE, EVENTS.VOLUNTEER_HOURS.REJECT])(
    '%s: the Ore list, its totals, the entry and the home impact load again',
    (key) => {
      refreshAfterPush(key);
      expect(invalidated()).toEqual([
        'activity-log',
        'activity-logs',
        'logs-counters',
        'personal-statistics',
      ]);
    },
  );

  it('an uploaded contract: the Documente list and the document counters load again', () => {
    refreshAfterPush(EVENTS.DOCUMENTS.GENERATE_CONTRACT);
    expect(invalidated()).toEqual(['contract-history', 'monthly-statistics', 'volunteer-stats']);
  });

  it('other pushes and unknown payloads leave the data alone', () => {
    refreshAfterPush(EVENTS.OTHER.SEND_ANNOUNCEMENT);
    refreshAfterPush(undefined);
    refreshAfterPush({ key: 'x' });
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});

describe('NotificationContextProvider (#691)', () => {
  const navigation = {
    isReady: () => false,
    getRootState: () => undefined,
    addListener: () => () => undefined,
    navigate: jest.fn(),
  };

  it('an approval that arrives while the app is open refreshes the data on screen', async () => {
    const { unmount } = await render(
      <NotificationContextProvider navigation={navigation}>{null}</NotificationContextProvider>,
    );
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledTimes(1);

    await act(async () =>
      mockReceived.forEach((listener) => listener(push('other.send.announcement'))),
    );
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();

    await act(async () =>
      mockReceived.forEach((listener) => listener(push(EVENTS.JOIN_NGO.APPROVE_REQUEST))),
    );
    expect(invalidated()).toEqual(['organization', 'organizations', 'user-profile']);

    await unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
