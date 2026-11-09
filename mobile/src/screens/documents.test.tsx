import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import '../common/config/i18n';
import Documents from './Documents';
import ContractHistory from './ContractHistory';
import useStore from '../store/store';
import { ClientContractStatus } from '../common/enums/client-contract-status.enum';
import { formatContractDay } from '../components/documents/DocumentRow';

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
  error: null,
  isFetching: false,
  isRefetching: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
});

jest.mock('../services/contract/contract.service', () => ({
  useContractHistoryInfiniteQuery: () => page(mockSigned),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const renderApp = (initialRouteName = 'docs') =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="docs" component={Documents} />
          <Screen name="contract-history" component={ContractHistory} />
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
    expect(await screen.findByText('Documente')).toBeTruthy();
    expect(screen.getByText('La Asociația Exemplu')).toBeTruthy();
    const signed = screen.getByTestId('document-row-3');
    expect(within(signed).getByText('Contract 3/2026')).toBeTruthy();
    expect(within(signed).getByText('15 ian 2026 – 15 ian 2027')).toBeTruthy();
    expect(within(signed).getByText('Semnat')).toBeTruthy();
    expect(within(screen.getByTestId('document-row-2')).getByText('Expiră în curând')).toBeTruthy();
    const pending = screen.getByTestId('document-row-1');
    expect(within(pending).getByText('În așteptare')).toBeTruthy();
    expect(within(pending).getByText('din 15 ian 2026, fără dată de final')).toBeTruthy();
    // three contracts on the tab, the fourth behind "Vezi toate"
    expect(screen.queryByTestId('document-row-0')).toBeNull();
    expect(screen.getByText('Vezi toate (4)')).toBeTruthy();
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

  it('"Vezi toate" lists every contract', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('documents-signed-all'));
    expect(await screen.findByTestId('document-row-0')).toBeTruthy();
    expect(within(screen.getByTestId('document-row-0')).getByText('Expirat')).toBeTruthy();
  });

  it('without documents explains where contracts come from', async () => {
    mockSigned = [];
    await renderApp();
    expect(await screen.findByText('Niciun document încă')).toBeTruthy();
    expect(screen.getByText('Contractele încărcate de organizație apar aici.')).toBeTruthy();
  });

  it('formats contract days with Romanian short months', () => {
    expect(formatContractDay('2026-11-01T10:00:00.000Z')).toBe('1 nov 2026');
    expect(formatContractDay(null)).toBe('');
  });
});
