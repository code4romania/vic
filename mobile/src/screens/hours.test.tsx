import React from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import i18n from '../common/config/i18n';
import ActivityLogs from './ActivityLogs';
import ActivityLog from './ActivityLog';
import AddActivityLog from './AddActivityLog';
import useStore from '../store/store';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { formatLogLongDay, formatLogShortDay } from '../common/utils/activity-log-format';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
// the legacy pickers load their options from the API
jest.mock('../containers/EventSelect', () => () => null);
jest.mock('../containers/ActivityTypeSelect', () => () => null);
jest.mock('../components/FormDatePicker', () => () => null);
jest.mock('../components/FormInput', () => () => null);

const mockListCalls: any[][] = [];
const mockCancel = jest.fn();
const mockCreate = jest.fn();
let mockLogQuery: any = { isFetching: false };

const entry = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  date: '08.11.2026',
  hours: 6,
  activityType: { id: 'a1', name: 'Asistență medicală', icon: 'heart' },
  event: { id: 'e1', name: 'Training: Prim ajutor' },
  ...extra,
});

jest.mock('../services/activity-log/activity-log.service', () => ({
  useActivityLogsInfiniteQuery: (...args: any[]) => {
    mockListCalls.push(args);
    const status = args[3];
    // disabled without an organization: no data
    const items = !args[0]
      ? []
      : status === 'pending'
        ? [entry('1'), entry('2', { event: undefined, activityType: undefined, hours: 3 })]
        : status === 'approved'
          ? [entry('3', { hours: 4 })]
          : [];
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
  useActivityLogsCounters: () => ({ refetch: jest.fn() }),
  useActivityLogQuery: () => mockLogQuery,
  useCancelActivityLogMutation: () => ({ mutate: mockCancel, isLoading: false }),
  useCreateActivityLogMutation: () => ({ mutate: mockCreate, isLoading: false }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Stub = () => null;

const renderApp = (initialRouteName = 'hours', params?: Record<string, unknown>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="hours" component={ActivityLogs} />
          <Screen name="activity-log" component={ActivityLog} initialParams={params} />
          <Screen name="add-activity-log" component={AddActivityLog} />
          <Screen name="edit-activity-log" component={Stub} />
          <Screen name="volunteer-profile" component={Stub} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const setProfile = (volunteerProfileId: string | null = 'p1') =>
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      activeOrganization: {
        id: 'org-1',
        name: 'Asociația Exemplu',
        logo: '',
        volunteerId: 'v1',
        volunteerProfileId,
      },
    } as any,
    counters: { approved: 145, pending: 9, rejected: 5 },
    selectedActivityLog: undefined,
  });

const detail = (status: ActivityLogStatus, extra: Record<string, unknown> = {}) =>
  useStore.setState({
    selectedActivityLog: {
      ...entry('1'),
      status,
      mentions: 'Am ajutat la standul de prim ajutor.',
      organization: { id: 'org-1', name: 'Asociația Exemplu', logo: '' },
      ...extra,
    } as any,
  });

const detailParams = {
  activityLogId: '1',
  orderDirection: OrderDirection.DESC,
  search: '',
  status: ActivityLogStatus.PENDING,
  volunteerId: 'v1',
};

beforeEach(() => {
  mockLogQuery = { isFetching: false, error: null, refetch: jest.fn() };
  mockListCalls.length = 0;
  jest.clearAllMocks();
  setProfile();
});

describe('Ore', () => {
  it('shows the organization, the totals and the pending entries first, newest first', async () => {
    await renderApp();
    expect(await screen.findByText('Ore de voluntariat')).toBeTruthy();
    expect(screen.getByText('La Asociația Exemplu')).toBeTruthy();
    expect(within(screen.getByTestId('hours-total-approved')).getByText('145h')).toBeTruthy();
    expect(within(screen.getByTestId('hours-total-pending')).getByText('9h')).toBeTruthy();
    const last = mockListCalls[mockListCalls.length - 1];
    // the organization is part of the query (audit #8)
    expect(last[0]).toBe('org-1');
    expect(last[1]).toBe(OrderDirection.DESC);
    expect(last[3]).toBe(ActivityLogStatus.PENDING);
    const row = screen.getByTestId('log-row-1');
    expect(within(row).getByText('6h')).toBeTruthy();
    expect(within(row).getByText('Asistență medicală')).toBeTruthy();
    expect(within(row).getByText('Training: Prim ajutor · 8 nov')).toBeTruthy();
    expect(within(row).getByText('În așteptare')).toBeTruthy();
    // no task and no event: "Altă opțiune" and only the day
    expect(within(screen.getByTestId('log-row-2')).getByText('Altă opțiune')).toBeTruthy();
    expect(within(screen.getByTestId('log-row-2')).getByText('8 nov')).toBeTruthy();
  });

  it('switches status with the segmented control and shows an empty state', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByText('Aprobate'));
    expect(mockListCalls[mockListCalls.length - 1][3]).toBe(ActivityLogStatus.APPROVED);
    expect(within(await screen.findByTestId('log-row-3')).getByText('Aprobat')).toBeTruthy();
    await fireEvent.press(screen.getByText('Respinse'));
    expect(await screen.findByText('Nicio înregistrare refuzată')).toBeTruthy();
  });

  it('without an active organization shows an empty state and asks nothing (audit #7)', async () => {
    useStore.setState({ userProfile: { firstName: 'Ana', activeOrganization: null } as any });
    await renderApp();
    expect(await screen.findByTestId('hours-no-organization')).toBeTruthy();
    expect(mockListCalls[mockListCalls.length - 1][0]).toBeUndefined();
    expect(screen.queryByTestId('hours-add')).toBeNull();
    expect(screen.queryByTestId('hours-total-approved')).toBeNull();
  });

  it('"+ Adaugă ore" without a volunteer profile asks to fill it in', async () => {
    setProfile(null);
    await renderApp();
    await fireEvent.press(await screen.findByTestId('hours-add'));
    expect(screen.getByText('Completează datele')).toBeTruthy();
  });

  it('asks before closing changed hours and keeps them when staying', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderApp();
    await fireEvent.press(await screen.findByTestId('hours-add'));
    await fireEvent.press(await screen.findByTestId('hours-stepper-plus'));
    await fireEvent.press(screen.getByTestId('modal-close'));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('hours-stepper-value').props.children).toBe('2h');
    const buttons = alert.mock.calls[0][2]!;
    expect(buttons[0].style).toBe('cancel');
    await act(async () => buttons[1].onPress!());
    expect(await screen.findByTestId('hours-add')).toBeTruthy();
    alert.mockRestore();
  });

  it('closes unchanged hours without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderApp();
    await fireEvent.press(await screen.findByTestId('hours-add'));
    await fireEvent.press(await screen.findByTestId('modal-close'));
    expect(await screen.findByTestId('hours-add')).toBeTruthy();
    expect(alert).not.toHaveBeenCalled();
    alert.mockRestore();
  });

  it('adds hours from today with the − / + stepper', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('hours-add'));
    expect(await screen.findByText('Adaugă ore de voluntariat')).toBeTruthy();
    expect(screen.getByTestId('hours-stepper-value').props.children).toBe('1h');
    await fireEvent.press(screen.getByTestId('hours-stepper-plus'));
    await fireEvent.press(screen.getByTestId('hours-stepper-plus'));
    expect(screen.getByTestId('hours-stepper-value').props.children).toBe('3h');
    await fireEvent.press(screen.getByTestId('hours-stepper-minus'));
    expect(screen.getByTestId('hours-stepper-value').props.children).toBe('2h');
  });
});

describe('Ore: detaliu', () => {
  it.each<[string, number, string]>([
    ['ro', 1, 'Ora de la Asistență medicală nu mai ajunge la organizație.'],
    ['ro', 2, 'Cele 2 ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 19, 'Cele 19 ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 20, 'Cele 20 de ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 24, 'Cele 24 de ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 100, 'Cele 100 de ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 101, 'Cele 101 ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 1.5, 'Cele 1.5 ore de la Asistență medicală nu mai ajung la organizație.'],
    ['ro', 20.5, 'Cele 20.5 ore de la Asistență medicală nu mai ajung la organizație.'],
    ['en', 1, 'The hour for Asistență medicală will no longer reach the organization.'],
    ['en', 2, 'The 2 hours for Asistență medicală will no longer reach the organization.'],
    ['en', 20, 'The 20 hours for Asistență medicală will no longer reach the organization.'],
    ['en', 1.5, 'The 1.5 hours for Asistență medicală will no longer reach the organization.'],
  ])('uses the %s confirmation for %s hours', async (language, hours, expected) => {
    await act(async () => {
      await i18n.changeLanguage(language);
    });
    try {
      detail(ActivityLogStatus.PENDING, { hours });
      await renderApp('activity-log', detailParams);
      await fireEvent.press(await screen.findByTestId('log-delete'));
      expect(screen.getByText(expected)).toBeTruthy();
    } finally {
      await act(async () => {
        await i18n.changeLanguage('ro');
      });
    }
  });

  it('a pending entry can be deleted after confirming', async () => {
    detail(ActivityLogStatus.PENDING);
    await renderApp('activity-log', detailParams);
    expect(await screen.findByText('8 noiembrie 2026')).toBeTruthy();
    expect(screen.getByText(/Până atunci o poți edita sau șterge/)).toBeTruthy();
    expect(screen.getByText('Am ajutat la standul de prim ajutor.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('log-delete'));
    expect(
      screen.getByText('Cele 6 ore de la Asistență medicală nu mai ajung la organizație.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByTestId('log-delete-confirm'));
    expect(mockCancel).toHaveBeenCalledWith({ activityLogId: '1' }, expect.any(Object));
  });

  it('an entry that no longer exists says so instead of a blank page', async () => {
    mockLogQuery = {
      isFetching: false,
      error: { response: { status: 404 } },
      refetch: jest.fn(),
    };
    await renderApp('activity-log', detailParams);
    expect(await screen.findByTestId('log-error')).toBeTruthy();
  });

  it('a rejected entry shows the reason and cannot be edited', async () => {
    detail(ActivityLogStatus.REJECTED, {
      rejectedOn: '14/10/2026',
      rejectionReason: 'Transportul a fost făcut în altă zi.',
    });
    await renderApp('activity-log', detailParams);
    expect(await screen.findByText('Respinsă la 14 octombrie 2026')).toBeTruthy();
    expect(screen.getByText(/Transportul a fost făcut în altă zi\./)).toBeTruthy();
    expect(screen.queryByTestId('log-edit')).toBeNull();
    expect(screen.queryByTestId('log-delete')).toBeNull();
  });

  it('an approved entry shows when it was approved', async () => {
    detail(ActivityLogStatus.APPROVED, { approvedOn: '28/10/2026' });
    await renderApp('activity-log', detailParams);
    expect(await screen.findByText('Aprobată la 28 octombrie 2026')).toBeTruthy();
  });
});

describe('activity log dates', () => {
  it('reads the API formats and keeps unknown text', () => {
    expect(formatLogShortDay('08.11.2026')).toBe('8 nov');
    expect(formatLogLongDay('28/10/2026')).toBe('28 octombrie 2026');
    expect(formatLogLongDay('')).toBe('');
    expect(formatLogShortDay('ieri')).toBe('ieri');
  });
});
