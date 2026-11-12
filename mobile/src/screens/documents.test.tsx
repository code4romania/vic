import React from 'react';
import { StyleSheet } from 'react-native';
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
import { formatContractDay } from '../components/documents/DocumentRow';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockDownload = jest.fn();
jest.mock('../common/utils/download-contract', () => ({
  downloadContract: (...args: any[]) => mockDownload(...args),
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

describe('Documente', () => {
  it('lists the uploaded contracts with their period and status (#486, #488)', async () => {
    await renderApp();
    const header = within(await screen.findByTestId('documents-header'));
    expect(header.getByText('Documente')).toBeTruthy();
    expect(header.getByText('La Asociația Exemplu')).toBeTruthy();
    const list = within(screen.getByTestId('documents-list'));
    expect(list.queryByText('Documente')).toBeNull();
    expect(list.queryByText('La Asociația Exemplu')).toBeNull();
    const signed = screen.getByTestId('document-row-3');
    expect(within(signed).getByText('Contract 3/2026')).toBeTruthy();
    expect(within(signed).getByText('15 ian 2026 – 15 ian 2027')).toBeTruthy();
    expect(within(signed).getByText('Semnat')).toBeTruthy();
    expect(within(screen.getByTestId('document-row-2')).getByText('Expiră în curând')).toBeTruthy();
    const pending = screen.getByTestId('document-row-1');
    expect(within(pending).getByText('În așteptare')).toBeTruthy();
    expect(within(pending).getByText('din 15 ian 2026, fără dată de final')).toBeTruthy();
    expect(screen.getByTestId('documents')).toBeTruthy();
    expect(screen.queryByTestId('documents-back')).toBeNull();
    expect(within(screen.getByTestId('document-row-0')).getByText('Expirat')).toBeTruthy();
    expect(screen.queryByText(/Vezi toate/)).toBeNull();
    expect(screen.queryByText('Contractele tale')).toBeNull();
    expect(screen.queryByText(/semnătura ta/)).toBeNull();
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
    expect(within(row).getByText('Adeverință 45/2026')).toBeTruthy();
    expect(within(row).getByText('emisă la 15 ian 2026')).toBeTruthy();
    expect(within(row).getByText('Semnat')).toBeTruthy();
  });

  it('a signed contract downloads, and a failed download says so', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('document-row-3'));
    expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
    mockDownload.mockRejectedValueOnce(new Error('offline'));
    await fireEvent.press(screen.getByTestId('document-row-2'));
    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: expect.stringContaining('descărca') }),
      ),
    );
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
    expect(screen.getByText('Niciun document încă')).toBeTruthy();
    expect(screen.getByText('Contractele încărcate de organizație apar aici.')).toBeTruthy();
  });

  it('shows an error and retries the request', async () => {
    mockHistory = page([]);
    mockHistory.error = new Error('offline');
    await renderApp();
    const empty = screen.getByTestId('documents-empty');
    expect(within(empty).getByText('Eroare la încărcarea documentelor')).toBeTruthy();
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
    expect(within(screen.getByTestId('documents-list')).queryByTestId('documents-back')).toBeNull();
  });

  it('updates list padding and refresh offset when the header grows', async () => {
    await renderApp();
    for (const height of [260, 340]) {
      await fireEvent(screen.getByTestId('documents-header'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width: 390, height } },
      });
      const list = screen.getByTestId('documents-list');
      expect(StyleSheet.flatten(list.props.contentContainerStyle).paddingTop).toBe(height + 18);
      expect(list.props.refreshControl.props.progressViewOffset).toBe(height);
    }
  });

  it('requests documents in descending order', async () => {
    const response = { items: [], meta: { totalItems: 0 } };
    jest.mocked(API.get).mockResolvedValueOnce({ data: response });
    expect(await getContractsHistory({ volunteerId: 'v1', pageParam: 2 })).toEqual(response);
    expect(API.get).toHaveBeenCalledWith('/mobile/contract/history', {
      params: { limit: 15, page: 2, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
    });
  });

  it('formats contract days with Romanian short months', () => {
    expect(formatContractDay('2026-11-01T10:00:00.000Z')).toBe('1 nov 2026');
    expect(formatContractDay(null)).toBe('');
  });
});
