import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import '../common/config/i18n';
import Documents from './Documents';
import ContractHistory from './ContractHistory';
import PendingContracts from './PendingContracts';
import useStore from '../store/store';
import { ClientContractStatus } from '../common/enums/client-contract-status.enum';
import { formatContractDay } from '../components/documents/DocumentRow';

const mockDownload = jest.fn();
jest.mock('../common/utils/download-contract', () => ({
  downloadContract: (...args: any[]) => mockDownload(...args),
}));

const contract = (id: string, status: ClientContractStatus) => ({
  id,
  contractNumber: `${id}/2026`,
  startDate: '2026-01-15T00:00:00.000Z',
  endDate: '2027-01-15T00:00:00.000Z',
  path: `https://files/${id}.pdf`,
  status,
  contractFileName: `contract-${id}.pdf`,
});

let mockPending: any[] = [];
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
  usePendingContractsInfiniteQuery: () => page(mockPending),
  useContractHistoryInfiniteQuery: () => page(mockSigned),
}));

const { Navigator, Screen } = createNativeStackNavigator();
const ContractStub = ({ route }: any) => {
  const { Text } = require('react-native');
  return <Text>{`contract:${route.params.id}`}</Text>;
};

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
          <Screen name="pending-contracts" component={PendingContracts} />
          <Screen name="contract-history" component={ContractHistory} />
          <Screen name="contract" component={ContractStub} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockDownload.mockResolvedValue(undefined);
  mockPending = [contract('7', ClientContractStatus.PENDING_VOLUNTEER)];
  mockSigned = [
    contract('3', ClientContractStatus.ACTIVE),
    contract('2', ClientContractStatus.CLOSED),
    contract('1', ClientContractStatus.CLOSED),
    contract('0', ClientContractStatus.CLOSED),
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
  it('shows contracts to sign first, then the signed ones with their period and status', async () => {
    await renderApp();
    expect(await screen.findByText('Documente')).toBeTruthy();
    expect(screen.getByText('La Asociația Exemplu')).toBeTruthy();
    expect(screen.getByText('Contracte care așteaptă semnătura ta: 1')).toBeTruthy();
    const toSign = screen.getByTestId('document-row-7');
    expect(within(toSign).getByText('Contract 7/2026')).toBeTruthy();
    expect(within(toSign).getByText('15 ian 2026 – 15 ian 2027')).toBeTruthy();
    expect(within(toSign).getByText('De semnat')).toBeTruthy();
    expect(within(screen.getByTestId('document-row-3')).getByText('Activ')).toBeTruthy();
    // three signed contracts on the tab, the fourth behind "Vezi toate"
    expect(screen.queryByTestId('document-row-0')).toBeNull();
    expect(screen.getByText('Vezi toate (4)')).toBeTruthy();
  });

  it('a contract to sign opens the signing page', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('document-row-7'));
    expect(await screen.findByText('contract:7')).toBeTruthy();
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

  it('"Vezi toate" lists every signed contract', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('documents-signed-all'));
    expect(await screen.findByTestId('document-row-0')).toBeTruthy();
    expect(screen.getByText('Istoric contracte semnate')).toBeTruthy();
  });

  it('without documents explains where contracts come from', async () => {
    mockPending = [];
    mockSigned = [];
    await renderApp();
    expect(await screen.findByText('Niciun document încă')).toBeTruthy();
    expect(screen.queryByTestId('documents-pending')).toBeNull();
  });

  it('formats contract days with Romanian short months', () => {
    expect(formatContractDay('2026-11-01T10:00:00.000Z')).toBe('1 nov 2026');
    expect(formatContractDay(null)).toBe('');
  });
});
