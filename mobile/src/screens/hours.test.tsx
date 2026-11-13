import React from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import i18n from '../common/config/i18n';
import ActivityLogs from './ActivityLogs';
import ActivityLog from './ActivityLog';
import AddActivityLog from './AddActivityLog';
import useStore from '../store/store';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { formatLogLongDay, formatLogShortDay } from '../common/utils/activity-log-format';
import { QueryClient, QueryClientProvider } from 'react-query';
import { queryKeys } from '../services/query-keys';
import GlassTabBar from '../components/navigation/GlassTabBar';
import { TabBarScrollProvider } from '../components/navigation/TabBarScroll';
import { SUCCESS_DWELL_MS } from '../components/hours/AddHoursSheet';

// the bottom-sheet mock renders a modal's content but not its sticky footer: draw it too
jest.mock('@gorhom/bottom-sheet', () => {
  const mock = require('@gorhom/bottom-sheet/mock');
  const ReactLib = require('react');
  class BottomSheetModal extends mock.BottomSheetModal {
    render() {
      const { children, footerComponent: Footer } = this.props as any;
      return ReactLib.createElement(
        ReactLib.Fragment,
        null,
        children,
        Footer ? ReactLib.createElement(Footer, {}) : null,
      );
    }
  }
  return {
    ...mock,
    BottomSheetModal,
    BottomSheetFooter: ({ children }: any) => children,
  };
});
jest.mock('expo-blur', () => ({ BlurView: () => null }));
jest.mock('expo-glass-effect', () => ({
  GlassView: () => null,
  isLiquidGlassAvailable: () => false,
}));
// the event picker loads its options from the API; the activities come from a mocked API below
jest.mock('../containers/EventSelect', () => () => null);
jest.mock('../components/FormDatePicker', () => () => null);
jest.mock('../components/FormInput', () => () => null);
jest.mock('../services/activity-type/activity-type.api', () => ({
  getActivityTypesByOrganizationId: async () => [{ id: 't1', name: 'Distribuire alimente' }],
}));
const mockActivate = jest.fn(async () => undefined);
jest.mock('../services/organization/organization.service', () => ({
  useActivateOrganization: () => ({ activate: mockActivate, isLoading: false }),
}));

const mockListCalls: any[][] = [];
const mockCancel = jest.fn();
const mockCreate = jest.fn();
const mockRefetchList = jest.fn();
const mockRefetchCounters = jest.fn();
// entries the API returns on top of the fixed ones (e.g. one just sent)
const mockSent: any[] = [];
let queryClient: QueryClient;
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
        ? [
            ...mockSent,
            entry('1'),
            entry('2', { event: undefined, activityType: undefined, hours: 3 }),
          ]
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
      refetch: mockRefetchList,
    };
  },
  useActivityLogsCounters: () => ({ refetch: mockRefetchCounters }),
  useActivityLogQuery: () => mockLogQuery,
  useCancelActivityLogMutation: () => ({ mutate: mockCancel, isLoading: false }),
  useCreateActivityLogMutation: () => ({ mutate: mockCreate, isLoading: false }),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stub = () => null;

// Ore as a tab, under the glass tab bar that holds its „Adaugă ore” action
const renderTabBar = (props: BottomTabBarProps) => (
  <GlassTabBar {...props} items={{ hours: { icon: 'hours', label: 'Ore' } }} />
);
const Tabs = () => (
  <TabBarScrollProvider>
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="hours" component={ActivityLogs} />
    </Tab.Navigator>
  </TabBarScrollProvider>
);

const renderApp = (initialRouteName = 'home', params?: Record<string, unknown>) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="home" component={Tabs} />
          <Screen name="activity-logs" component={ActivityLogs} />
          <Screen name="activity-log" component={ActivityLog} initialParams={params} />
          <Screen name="add-activity-log" component={AddActivityLog} />
          <Screen name="edit-activity-log" component={Stub} />
          <Screen name="volunteer-profile" component={Stub} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    },
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
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockLogQuery = { isFetching: false, error: null, refetch: jest.fn() };
  mockListCalls.length = 0;
  mockSent.length = 0;
  jest.clearAllMocks();
  setProfile();
});

afterEach(() => queryClient.clear());

// the „Adaugă ore” sheet, opened from the action beside the tab bar
const openAddSheet = async () => {
  await fireEvent.press(await screen.findByTestId('hours-add'));
  return within(await screen.findByTestId('hours-add-sheet'));
};

const pickActivity = async () => {
  await fireEvent.press(await screen.findByTestId('select-activityTypeId'));
  await fireEvent.press(await screen.findByTestId('select-activityTypeId-option-t1'));
};

describe('Ore', () => {
  it('opened from the volunteer page, puts the back button and the add action on the title row', async () => {
    await renderApp('activity-logs');
    const titleRow = within(await screen.findByTestId('hours-title-row'));
    expect(titleRow.getByTestId('hours-back')).toBeTruthy();
    expect(titleRow.getByRole('header', { name: i18n.t('activity_logs:title') })).toBeTruthy();
    expect(titleRow.getByTestId('hours-add')).toBeTruthy();
    // „Adaugă” with a lucide Plus before it, not a typed „+”
    expect(titleRow.getByText('Adaugă')).toBeTruthy();
    expect(titleRow.queryByText(/\+/)).toBeNull();
    expect(titleRow.getByTestId('hours-add').props.accessibilityLabel).toBe('Adaugă ore');
  });

  it('as the Ore tab, has no back button and puts „Adaugă ore” beside the tab bar', async () => {
    await renderApp();
    const titleRow = within(await screen.findByTestId('hours-title-row'));
    expect(screen.queryByTestId('hours-back')).toBeNull();
    expect(titleRow.queryByTestId('hours-add')).toBeNull();
    const bar = within(screen.getByTestId('glass-tab-bar'));
    const add = bar.getByTestId('hours-add');
    expect(add.props.accessibilityLabel).toBe('Adaugă ore');
    expect(bar.getByText('Adaugă ore')).toBeTruthy();
  });

  it('scrolls the organization, title, totals and status with the entries, under a compact bar', async () => {
    await renderApp();
    const list = within(await screen.findByTestId('hours-list'));
    expect(list.getByTestId('hours-organization')).toBeTruthy();
    expect(list.getByTestId('hours-title-row')).toBeTruthy();
    expect(list.getByTestId('hours-status')).toBeTruthy();
    const summary = within(list.getByTestId('hours-summary'));
    for (const status of ['approved', 'pending', 'rejected']) {
      expect(summary.getByTestId(`hours-total-${status}`)).toBeTruthy();
    }
    expect(summary.getByTestId('impact-hexagon', { includeHiddenElements: true })).toBeTruthy();
    // the large title and the compact one that comes in after scrolling
    // (the compact one is hidden from VoiceOver: the large title is the header)
    expect(screen.getAllByText('Ore de voluntariat', { includeHiddenElements: true })).toHaveLength(
      2,
    );
  });

  it('refetches the current list and counters on initial focus and when returning', async () => {
    await renderApp();
    expect(mockRefetchList).toHaveBeenCalledTimes(1);
    expect(mockRefetchCounters).toHaveBeenCalledTimes(1);

    // the add sheet opens over Ore: the screen keeps its focus
    await openAddSheet();
    expect(mockRefetchList).toHaveBeenCalledTimes(1);
    expect(mockRefetchCounters).toHaveBeenCalledTimes(1);

    // an entry opens on top of Ore; coming back reloads
    await fireEvent.press(screen.getByTestId('log-row-1'));
    await fireEvent.press(await screen.findByTestId('log-back'));
    expect(await screen.findByTestId('hours-list')).toBeTruthy();
    expect(mockRefetchList).toHaveBeenCalledTimes(2);
    expect(mockRefetchCounters).toHaveBeenCalledTimes(2);
  });

  it('does not refetch again when updated counters rerender the focused screen', async () => {
    await renderApp();
    await act(async () => {
      useStore.setState({ counters: { approved: 151, pending: 3, rejected: 5 } });
    });

    // the legend counts to the new totals (prototype count-up)
    await waitFor(() =>
      expect(within(screen.getByTestId('hours-total-approved')).getByText('151h')).toBeTruthy(),
    );
    expect(mockRefetchList).toHaveBeenCalledTimes(1);
    expect(mockRefetchCounters).toHaveBeenCalledTimes(1);
  });

  it('marks cached segments stale on focus without fetching them', async () => {
    const fetchList = jest.fn(async () => ({ pages: [] }));
    const keys = Object.values(ActivityLogStatus).map((status) =>
      queryKeys.activityLogs('org-1', OrderDirection.DESC, '', status),
    );
    for (const key of keys) {
      await queryClient.fetchQuery(key, fetchList, { staleTime: Infinity });
    }
    fetchList.mockClear();

    await renderApp();

    for (const key of keys) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
    expect(fetchList).not.toHaveBeenCalled();
    expect(mockRefetchList).toHaveBeenCalledTimes(1);
    expect(mockRefetchCounters).toHaveBeenCalledTimes(1);
  });

  it('shows the organization, the totals and the pending entries first, newest first', async () => {
    await renderApp();
    expect(await screen.findAllByText('Ore de voluntariat')).toBeTruthy();
    expect(screen.getByLabelText('La Asociația Exemplu')).toBeTruthy();
    expect(
      within(screen.getByTestId('hours-organization')).getByText('Asociația Exemplu'),
    ).toBeTruthy();
    // approved counts up from 0 with the hexagon refill
    await waitFor(() =>
      expect(within(screen.getByTestId('hours-total-approved')).getByText('145h')).toBeTruthy(),
    );
    expect(within(screen.getByTestId('hours-total-pending')).getByText('9h')).toBeTruthy();
    expect(within(screen.getByTestId('hours-total-rejected')).getByText('5h')).toBeTruthy();
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
    // the number of pending entries on its segment
    expect(within(screen.getByTestId('hours-status')).getByText('2')).toBeTruthy();
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
    expect(screen.queryByTestId('hours-organization')).toBeNull();
  });

  it('an inactive volunteer cannot add hours', async () => {
    useStore.setState({
      userProfile: {
        firstName: 'Ana',
        activeOrganization: {
          id: 'org-1',
          name: 'Asociația Exemplu',
          volunteerId: 'v1',
          volunteerProfileId: 'p1',
          volunteerStatus: 'inactive',
        },
      } as any,
    });
    await renderApp();
    expect(await screen.findByTestId('hours-summary')).toBeTruthy();
    expect(screen.queryByTestId('hours-add')).toBeNull();
  });

  it('"Adaugă ore" without a volunteer profile asks to fill it in', async () => {
    setProfile(null);
    await renderApp();
    await fireEvent.press(await screen.findByTestId('hours-add'));
    expect(screen.getByText('Completează datele')).toBeTruthy();
    expect(screen.queryByTestId('hours-add-sheet')).toBeNull();
  });

  it('switches the organization from the chip', async () => {
    useStore.setState({
      userProfile: {
        firstName: 'Ana',
        activeOrganization: {
          id: 'org-1',
          name: 'Asociația Exemplu',
          volunteerId: 'v1',
          volunteerProfileId: 'p1',
        },
        myOrganizations: [
          { id: 'org-1', name: 'Asociația Exemplu', volunteerId: 'v1', volunteerProfileId: 'p1' },
          { id: 'org-2', name: 'Verde Mare', volunteerId: 'v2', volunteerProfileId: 'p2' },
          {
            id: 'org-3',
            name: 'Candidat',
            volunteerId: 'v3',
            volunteerProfileId: null,
            volunteerStatus: 'candidate',
          },
        ],
      } as any,
    });
    await renderApp();
    expect(screen.getByTestId('hours-organization').props.accessibilityHint).toBe(
      'Schimbă organizația',
    );
    expect(screen.getByTestId('hours-organization-org-1')).toBeTruthy();
    expect(screen.queryByTestId('hours-organization-org-3')).toBeNull();
    await fireEvent.press(screen.getByTestId('hours-organization'));
    await fireEvent.press(screen.getByTestId('hours-organization-org-2'));
    expect(mockActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'org-2' }));
  });

  it('opens „Adaugă ore” as a sheet with the form of the prototype', async () => {
    await renderApp();
    const sheet = await openAddSheet();
    expect(sheet.getByRole('header', { name: 'Adaugă ore' })).toBeTruthy();
    expect(sheet.getByTestId('hours-stepper-value').props.children).toBe('1h');
    expect(sheet.getByText(/^Activitate/)).toBeTruthy();
    expect(sheet.getByTestId('select-activityTypeId')).toBeTruthy();
    expect(screen.getByTestId('hours-submit').props.accessibilityLabel).toBe(
      'Trimite spre aprobare',
    );
    // the arrow is a lucide icon after the label, not a typed „→”
    expect(screen.getByText('Trimite spre aprobare')).toBeTruthy();
    expect(screen.queryByText(/→/)).toBeNull();
  });

  it('asks before closing changed hours and keeps them when staying', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderApp();
    const sheet = await openAddSheet();
    await fireEvent.press(sheet.getByTestId('hours-stepper-plus'));
    await fireEvent.press(sheet.getByTestId('hours-add-sheet-close'));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(sheet.getByTestId('hours-stepper-value').props.children).toBe('2h');
    const buttons = alert.mock.calls[0][2]!;
    expect(buttons[0].style).toBe('cancel');
    expect(buttons[1].style).toBe('destructive');
    alert.mockRestore();
  });

  it('closes unchanged hours without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderApp();
    const sheet = await openAddSheet();
    await fireEvent.press(sheet.getByTestId('hours-add-sheet-close'));
    expect(alert).not.toHaveBeenCalled();
    alert.mockRestore();
  });

  it('adds hours from today with the − / + stepper', async () => {
    await renderApp();
    const sheet = await openAddSheet();
    expect(sheet.getByTestId('hours-stepper-value').props.children).toBe('1h');
    await fireEvent.press(sheet.getByTestId('hours-stepper-plus'));
    await fireEvent.press(sheet.getByTestId('hours-stepper-plus'));
    expect(sheet.getByTestId('hours-stepper-value').props.children).toBe('3h');
    await fireEvent.press(sheet.getByTestId('hours-stepper-minus'));
    expect(sheet.getByTestId('hours-stepper-value').props.children).toBe('2h');
  });

  it('does not send without an activity and says why', async () => {
    await renderApp();
    await openAddSheet();
    await fireEvent.press(screen.getByTestId('hours-submit'));
    expect(await screen.findByText('Alegerea activității este obligatorie')).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sends the hours, shows „Trimis spre aprobare”, then highlights the new entry', async () => {
    mockCreate.mockImplementation((_payload: any, options: any) => {
      mockSent.push(entry('new', { hours: 3 }));
      options.onSuccess({ ...entry('new', { hours: 3 }), status: 'pending' });
    });
    await renderApp();
    await fireEvent.press(await screen.findByText('Aprobate'));
    const sheet = await openAddSheet();
    await pickActivity();
    await fireEvent.press(sheet.getByTestId('hours-stepper-plus'));
    await fireEvent.press(sheet.getByTestId('hours-stepper-plus'));
    await fireEvent.press(screen.getByTestId('hours-submit'));

    expect(mockCreate).toHaveBeenCalledWith(
      {
        activityLog: expect.objectContaining({
          activityTypeId: 't1',
          hours: 3,
          volunteerId: 'v1',
        }),
      },
      expect.any(Object),
    );
    const done = within(await screen.findByTestId('hours-sent'));
    expect(done.getByText('Trimis spre aprobare')).toBeTruthy();
    expect(
      done.getByText(
        '3 ore la Asociația Exemplu. Primești notificare când coordonatorul le aprobă.',
      ),
    ).toBeTruthy();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

    // the sheet closes: back on the pending entries, the new one glows
    expect(
      await screen.findByTestId('log-row-new-highlight', undefined, {
        timeout: SUCCESS_DWELL_MS + 2000,
      }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(mockListCalls[mockListCalls.length - 1][3]).toBe(ActivityLogStatus.PENDING),
    );
    // then the toast confirms it (prototype: „4h trimise spre aprobare”)
    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: '3h trimise spre aprobare',
      }),
    );
    // no event chosen: no empty event id is sent
    expect(mockCreate.mock.calls[0][0].activityLog.eventId).toBeUndefined();
  });
});

describe('Adaugă ore (add-activity-log route)', () => {
  it('still opens as a screen for deep links and other callers', async () => {
    await renderApp('add-activity-log');
    expect(await screen.findByText('Adaugă ore de voluntariat')).toBeTruthy();
    expect(screen.getByTestId('hours-stepper-value').props.children).toBe('1h');
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
