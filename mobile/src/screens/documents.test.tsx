import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import '../common/config/i18n';
import Documents from './Documents';
import useStore from '../store/store';
import { ClientContractStatus } from '../common/enums/client-contract-status.enum';
import API from '../services/api';
import { getContractsHistory } from '../services/contract/contract.api';
import { OrderDirection } from '../common/enums/order-direction.enum';
import {
  contractProgress,
  daysLeft,
  formatContractDay,
  pickExpiringSoon,
} from '../components/documents/DocumentRow';
import { containing, inLanguage, shortMonthName, t } from '../test/i18n';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockDownload = jest.fn();
jest.mock('../common/utils/download-contract', () => ({
  downloadContract: (...args: any[]) => mockDownload(...args),
}));

// #727: true on binaries with the viewer's native code; false on older ones (over-the-air JS)
let mockViewerAvailable = false;
jest.mock('../components/documents/pdf-viewer-available', () => ({
  isPdfViewerAvailable: () => mockViewerAvailable,
}));

const contract = (
  id: string,
  status: ClientContractStatus,
  over: Record<string, unknown> = {},
) => ({
  id,
  contractNumber: `${id}/2026`,
  startDate: '2026-01-15T00:00:00.000Z',
  endDate: '2027-01-15T00:00:00.000Z',
  path: `https://files/${id}.pdf`,
  status,
  expiringSoon: false,
  contractFileName: `contract-${id}.pdf`,
  ...over,
});

let mockSigned: any[] = [];
const page = (items: any[]) => ({
  data: { pages: [{ items, meta: { totalItems: items.length } }] },
  error: null as Error | null,
  isFetching: false,
  isRefetching: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  reloadFirstPage: jest.fn(),
});

let mockHistory: ReturnType<typeof page>;
const mockHistoryQuery = jest.fn();
jest.mock('../services/contract/contract.service', () => ({
  useContractHistoryInfiniteQuery: (volunteerId: string | undefined) => {
    mockHistoryQuery(volunteerId);
    return mockHistory;
  },
}));

const { Navigator, Screen } = createNativeStackNavigator();
const renderApp = (initialRouteName = 'docs', initialParams = {}) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name={initialRouteName} component={Documents} initialParams={initialParams} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockViewerAvailable = false;
  mockDownload.mockResolvedValue(undefined);
  mockSigned = [
    contract('3', ClientContractStatus.SIGNED),
    contract('2', ClientContractStatus.SIGNED, { expiringSoon: true }),
    contract('1', ClientContractStatus.PENDING, { contractNumber: null, endDate: null }),
    contract('0', ClientContractStatus.EXPIRED),
  ];
  mockHistory = page(mockSigned);
  useStore.setState({
    userProfile: {
      firstName: 'Ana',
      activeOrganization: {
        id: 'org-1',
        name: 'Asociația Exemplu',
        logo: '',
        volunteerId: 'v1',
        volunteerProfileId: 'p1',
      },
    } as any,
  });
});

// the short name of January in the language the test runs in
const JAN = shortMonthName(0);

describe('Documente', () => {
  it('lists the uploaded contracts with their period and status (#486, #488)', async () => {
    await renderApp();
    const header = within(await screen.findByTestId('documents-header'));
    expect(header.getByRole('header', { name: t('documents:title_large') })).toBeTruthy();
    expect(header.getByText(t('activity_logs:at', { name: 'Asociația Exemplu' }))).toBeTruthy();
    // the large title scrolls with the list; the compact bar repeats the tab name
    expect(
      within(screen.getByTestId('documents-list')).getByText(
        t('documents:title_large').replace(/ (?=\S+$)/, '\n'),
      ),
    ).toBeTruthy();
    const bar = screen.getByTestId('documents-compact-bar', { includeHiddenElements: true });
    expect(
      within(bar).getByText(t('general:documents'), { includeHiddenElements: true }),
    ).toBeTruthy();
    // The status area stays covered even before the compact bar fades in at 48pt.
    expect(screen.getByTestId('status-bar-scrim')).toHaveStyle({
      height: 47,
      backgroundColor: '#F4F1E9',
    });
    expect(
      within(screen.getByTestId('documents-list')).queryByTestId('status-bar-scrim'),
    ).toBeNull();
    const signed = screen.getByTestId('document-row-3');
    expect(within(signed).getByText('Contract 3/2026')).toBeTruthy();
    expect(within(signed).getByText(`15 ${JAN} 2026 – 15 ${JAN} 2027`)).toBeTruthy();
    expect(within(signed).getByText(t('documents:status.SIGNED'))).toBeTruthy();
    expect(
      within(screen.getByTestId('document-row-2')).getByText(t('documents:expiring_soon')),
    ).toBeTruthy();
    const pending = screen.getByTestId('document-row-1');
    expect(within(pending).getByText(t('documents:status.PENDING'))).toBeTruthy();
    expect(
      within(pending).getByText(t('documents:period_open', { start: `15 ${JAN} 2026` })),
    ).toBeTruthy();
    expect(screen.getByTestId('documents')).toBeTruthy();
    expect(screen.queryByTestId('documents-back')).toBeNull();
    expect(
      within(screen.getByTestId('document-row-0')).getByText(t('documents:status.EXPIRED')),
    ).toBeTruthy();
    expect(screen.queryByText(containing(t('home:anouncements.section.see_all')))).toBeNull();
    expect(screen.queryByText(/semnătura ta/)).toBeNull();
  });

  it('features the contract that expires soonest, with the days left (#488)', async () => {
    const inDays = (days: number) => new Date(Date.now() + days * 86400000 - 3600000).toISOString();
    mockSigned = [
      contract('3', ClientContractStatus.SIGNED),
      contract('late', ClientContractStatus.SIGNED, { expiringSoon: true, endDate: inDays(20) }),
      contract('soon', ClientContractStatus.SIGNED, { expiringSoon: true, endDate: inDays(7) }),
    ];
    mockHistory = page(mockSigned);
    await renderApp();
    const featured = await screen.findByTestId('document-row-soon');
    expect(within(featured).getByText(t('documents:days_left', { count: 7 }))).toBeTruthy();
    expect(within(featured).getByText(t('documents:expiring_soon'))).toBeTruthy();
    expect(within(featured).getByText('soon/2026')).toBeTruthy();
    // #727: a tap opens the contract; the round button downloads it
    expect(within(featured).getByText(t('documents:featured_action'))).toBeTruthy();
    // the other one that expires soon stays a row with the orange chip
    const later = screen.getByTestId('document-row-late');
    expect(
      within(later).queryByText(containing(t('documents:days_left', { count: '' }).trim())),
    ).toBeNull();
    expect(within(later).getByText(t('documents:expiring_soon'))).toBeTruthy();
    await fireEvent.press(featured);
    expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: 'soon' }));
  });

  it('only the featured contract loaded: no empty state under it', async () => {
    mockHistory = page([contract('2', ClientContractStatus.SIGNED, { expiringSoon: true })]);
    await renderApp();
    expect(await screen.findByTestId('document-row-2')).toBeTruthy();
    expect(screen.queryByTestId('documents-empty')).toBeNull();
  });

  it('every contract has a validity bar; a certificate has none', async () => {
    mockSigned = [
      contract('3', ClientContractStatus.SIGNED),
      contract('9', ClientContractStatus.SIGNED, { type: 'CERTIFICATE', endDate: null }),
    ];
    mockHistory = page(mockSigned);
    await renderApp();
    expect(
      await screen.findByTestId('document-bar-3', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(screen.queryByTestId('document-bar-9', { includeHiddenElements: true })).toBeNull();
  });

  it('shows a certificate as "Adeverință", issued on a day (#490)', async () => {
    mockSigned = [
      contract('9', ClientContractStatus.SIGNED, {
        type: 'CERTIFICATE',
        contractNumber: '45/2026',
        endDate: null,
      }),
    ];
    mockHistory = page(mockSigned);
    await renderApp();
    const row = await screen.findByTestId('document-row-9');
    expect(within(row).getByText(`${t('documents:certificate_prefix')} 45/2026`)).toBeTruthy();
    expect(
      within(row).getByText(t('documents:issued_on', { date: `15 ${JAN} 2026` })),
    ).toBeTruthy();
    expect(within(row).getByText(t('documents:status.SIGNED'))).toBeTruthy();
  });

  it('a signed contract downloads, and a failed download says so', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('document-row-3'));
    expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
    mockDownload.mockRejectedValueOnce(new Error('offline'));
    await fireEvent.press(screen.getByTestId('document-row-2'));
    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: t('documents:download_error') }),
      ),
    );
  });

  // #727
  describe('viewer and Download', () => {
    const ViewerProbe = ({ route }: any) => {
      const { Text } = require('react-native');
      return <Text testID="viewer-probe">{route.params.contract.id}</Text>;
    };
    const renderWithViewer = () =>
      render(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <NavigationContainer>
            <Navigator initialRouteName="docs" screenOptions={{ headerShown: false }}>
              <Screen name="docs" component={Documents} />
              <Screen name="document-viewer" component={ViewerProbe} />
            </Navigator>
          </NavigationContainer>
        </SafeAreaProvider>,
      );

    it('a tap opens a PDF in the viewer; the round button downloads without opening it', async () => {
      mockViewerAvailable = true;
      await renderWithViewer();

      await fireEvent.press(await screen.findByTestId('document-download-3'));
      expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
      expect(screen.queryByTestId('viewer-probe')).toBeNull();

      await fireEvent.press(screen.getByTestId('document-row-2'));
      expect(await screen.findByTestId('viewer-probe')).toHaveTextContent('2');
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });

    it('a Word contract and a build without the viewer download on tap (#688)', async () => {
      mockViewerAvailable = true;
      mockSigned[0] = contract('3', ClientContractStatus.SIGNED, {
        contractFileName: 'contract-3.docx',
      });
      mockHistory = page(mockSigned);
      await renderWithViewer();
      await fireEvent.press(await screen.findByTestId('document-row-3'));
      expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
      expect(screen.queryByTestId('viewer-probe')).toBeNull();

      mockViewerAvailable = false;
      await fireEvent.press(screen.getByTestId('document-row-2'));
      expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
      expect(screen.queryByTestId('viewer-probe')).toBeNull();
    });

    it('labels the card with what a tap does, and the button with the document', async () => {
      mockViewerAvailable = true;
      await renderWithViewer();
      const row = await screen.findByTestId('document-row-3');
      expect(row.props.accessibilityLabel).toMatch(new RegExp(`, ${t('documents:view')}$`));
      expect(screen.getByTestId('document-download-3').props.accessibilityLabel).toBe(
        t('documents:download_named', { name: 'Contract 3/2026' }),
      );
    });
  });

  it('fetches the next page from the list', async () => {
    mockHistory.hasNextPage = true;
    await renderApp();
    await fireEvent(screen.getByTestId('documents-list'), 'onEndReached');
    expect(mockHistory.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it.each([
    { hasNextPage: false, isFetching: false, isFetchingNextPage: false },
    { hasNextPage: true, isFetching: true, isFetchingNextPage: false },
    { hasNextPage: true, isFetching: false, isFetchingNextPage: true },
  ])('does not fetch the next page when guarded by %j', async (state) => {
    Object.assign(mockHistory, state);
    await renderApp();
    await fireEvent(screen.getByTestId('documents-list'), 'onEndReached');
    expect(mockHistory.fetchNextPage).not.toHaveBeenCalled();
  });

  it('renders every loaded page and a footer while fetching more', async () => {
    mockHistory.data.pages.push({
      items: [contract('older', ClientContractStatus.EXPIRED)],
      meta: { totalItems: 5 },
    });
    mockHistory.isFetchingNextPage = true;
    mockHistory.hasNextPage = true;
    // react-query v3 also reports isRefetching while the next page loads
    mockHistory.isRefetching = true;
    await renderApp();
    expect(screen.getByTestId('document-row-3')).toBeTruthy();
    expect(screen.getByTestId('document-row-0')).toBeTruthy();
    expect(screen.getByTestId('document-row-older')).toBeTruthy();
    expect(screen.getByTestId('documents-loading-more')).toBeTruthy();
    // only the bottom spinner: the pull-to-refresh one stays hidden
    expect(screen.getByTestId('documents-list').props.refreshControl.props.refreshing).toBe(false);
  });

  it.each([
    { hasNextPage: false, isFetchingNextPage: true },
    { hasNextPage: true, isFetchingNextPage: false },
  ])('hides the footer when guarded by %j', async (state) => {
    Object.assign(mockHistory, state);
    await renderApp();
    expect(screen.queryByTestId('documents-loading-more')).toBeNull();
  });

  it('without documents explains where contracts come from', async () => {
    mockHistory = page([]);
    await renderApp();
    expect(await screen.findByTestId('documents-empty')).toBeTruthy();
    expect(screen.getByText(t('documents:empty.title'))).toBeTruthy();
    expect(screen.getByText(t('documents:empty.description'))).toBeTruthy();
  });

  it('shows an error and retries the request', async () => {
    mockHistory = page([]);
    mockHistory.error = new Error('offline');
    await renderApp();
    const empty = screen.getByTestId('documents-empty');
    expect(within(empty).getByText(t('documents:errors.generic'))).toBeTruthy();
    // Focus also reloads the query; isolate the explicit retry.
    mockHistory.reloadFirstPage.mockClear();
    await fireEvent.press(within(empty).getByRole('button'));
    expect(mockHistory.reloadFirstPage).toHaveBeenCalledTimes(1);
  });

  it('shows the no-organization state', async () => {
    mockHistory = page([]);
    useStore.setState({ userProfile: { firstName: 'Ana' } as any });
    await renderApp();
    expect(screen.getByTestId('documents-no-organization')).toBeTruthy();
    expect(screen.queryByTestId('documents-empty')).toBeNull();
    expect(mockHistoryQuery).toHaveBeenCalledWith(undefined);
  });

  it('uses the volunteer override and shows a back button outside the tab', async () => {
    await renderApp('documents', { volunteerId: 'override' });
    expect(mockHistoryQuery).toHaveBeenCalledWith('override');
    expect(
      within(screen.getByTestId('documents-header')).getByTestId('documents-back'),
    ).toBeTruthy();
    expect(screen.getByTestId('documents-back').props.accessibilityLabel).toBe(t('general:back'));
  });

  it('shows row skeletons while the first page loads', async () => {
    mockHistory = page([]);
    (mockHistory as any).data = undefined;
    mockHistory.isFetching = true;
    await renderApp();
    expect(screen.getByTestId('documents-loading')).toBeTruthy();
    expect(screen.queryByTestId('documents-empty')).toBeNull();
  });

  it('requests documents in descending order', async () => {
    const response = { items: [], meta: { totalItems: 0 } };
    jest.mocked(API.get).mockResolvedValueOnce({ data: response });
    expect(await getContractsHistory({ volunteerId: 'v1', pageParam: 2 })).toEqual(response);
    expect(API.get).toHaveBeenCalledWith('/mobile/contract/history', {
      params: { limit: 15, page: 2, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
    });
  });

  it('measures validity and the days left', () => {
    const now = Date.parse('2026-07-15T00:00:00.000Z');
    const signed = contract('a', ClientContractStatus.SIGNED) as any;
    expect(contractProgress(signed, now)).toBeCloseTo(181 / 365, 2);
    expect(contractProgress({ ...signed, status: ClientContractStatus.EXPIRED }, now)).toBe(1);
    expect(contractProgress({ ...signed, endDate: null }, now)).toBeCloseTo(181 / 365, 2);
    expect(contractProgress({ ...signed, type: 'CERTIFICATE' }, now)).toBeNull();
    expect(contractProgress({ ...signed, startDate: '2027-01-01T00:00:00.000Z' }, now)).toBe(0);
    expect(daysLeft(signed, now)).toBe(184);
    expect(daysLeft({ ...signed, endDate: null }, now)).toBeNull();
    expect(daysLeft({ ...signed, endDate: '2026-01-01T00:00:00.000Z' }, now)).toBe(0);
    expect(
      pickExpiringSoon([
        { ...signed, id: 'x', expiringSoon: true, endDate: '2026-08-01T00:00:00.000Z' },
        { ...signed, id: 'y', expiringSoon: true, endDate: '2026-07-20T00:00:00.000Z' },
        { ...signed, id: 'z', endDate: '2026-07-16T00:00:00.000Z' },
      ])?.id,
    ).toBe('y');
  });

  it('formats contract days with Romanian short months', async () => {
    await inLanguage('ro', () =>
      expect(formatContractDay('2026-11-01T10:00:00.000Z')).toBe('1 nov 2026'),
    );
    expect(formatContractDay(null)).toBe('');
  });

  it('and with English short months when the app is in English', async () => {
    await inLanguage('en', () =>
      expect(formatContractDay('2026-11-01T10:00:00.000Z')).toBe('1 Nov 2026'),
    );
  });
});
