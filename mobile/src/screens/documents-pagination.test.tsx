import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import '../common/config/i18n';
import Documents from './Documents';
import API from '../services/api';
import { useContractHistoryInfiniteQuery } from '../services/contract/contract.service';
import { queryKeys } from '../services/query-keys';
import { ClientContractStatus } from '../common/enums/client-contract-status.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import useStore from '../store/store';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('../common/utils/download-contract', () => ({
  downloadContract: jest.fn(),
}));

const { Navigator, Screen } = createNativeStackNavigator();
let queryClient: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const responseForPage = (page: number) => ({
  items: [
    {
      id: `page-${page}`,
      contractNumber: `${page}/2026`,
      startDate: '2026-01-15T00:00:00.000Z',
      endDate: '2027-01-15T00:00:00.000Z',
      path: `https://files/${page}.pdf`,
      status: ClientContractStatus.SIGNED,
      expiringSoon: false,
      contractFileName: `contract-${page}.pdf`,
    },
  ],
  meta: { currentPage: page, totalPages: 2, totalItems: 2, itemCount: 1, itemsPerPage: 15 },
});

const renderApp = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator screenOptions={{ headerShown: false }}>
          <Screen name="docs" component={Documents} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
    { wrapper },
  );

beforeEach(() => {
  jest.mocked(API.get).mockReset();
  jest.mocked(API.get).mockImplementation(async (_url, config) => ({
    data: responseForPage((config?.params as { page: number }).page),
  }));
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, cacheTime: 0 } },
  });
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

afterEach(() => queryClient.clear());

it('refreshes only page 1 and loads page 2 again on scroll', async () => {
  await renderApp();
  expect(await screen.findByTestId('document-row-page-1')).toBeTruthy();
  await waitFor(() =>
    expect(screen.getByTestId('documents-list').props.refreshControl.props.refreshing).toBe(false),
  );
  expect(API.get).toHaveBeenCalledWith('/mobile/contract/history', {
    params: { page: 1, limit: 15, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
  });

  await fireEvent(screen.getByTestId('documents-list'), 'onEndReached');
  expect(await screen.findByTestId('document-row-page-2')).toBeTruthy();
  expect(screen.getByTestId('document-row-page-1')).toBeTruthy();
  expect(API.get).toHaveBeenLastCalledWith('/mobile/contract/history', {
    params: { page: 2, limit: 15, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
  });

  jest.mocked(API.get).mockClear();
  await act(async () => {
    screen.getByTestId('documents-list').props.refreshControl.props.onRefresh();
  });
  await waitFor(() => {
    expect(screen.queryByTestId('document-row-page-2')).toBeNull();
    expect(screen.getByTestId('documents-list').props.refreshControl.props.refreshing).toBe(false);
  });
  expect(API.get).toHaveBeenCalledTimes(1);
  expect(API.get).toHaveBeenCalledWith('/mobile/contract/history', {
    params: { page: 1, limit: 15, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
  });
  expect(screen.getByTestId('document-row-page-1')).toBeTruthy();
  expect(queryClient.getQueryData(queryKeys.contractHistory('v1'))).toEqual({
    pages: [responseForPage(1)],
    pageParams: [undefined],
  });

  await fireEvent(screen.getByTestId('documents-list'), 'onEndReached');
  expect(await screen.findByTestId('document-row-page-2')).toBeTruthy();
  expect(API.get).toHaveBeenCalledTimes(2);
  expect(API.get).toHaveBeenLastCalledWith('/mobile/contract/history', {
    params: { page: 2, limit: 15, orderDirection: OrderDirection.DESC, volunteerId: 'v1' },
  });
});

it('does not request documents when reloading without a volunteer', async () => {
  const { result } = await renderHook(() => useContractHistoryInfiniteQuery(undefined), {
    wrapper,
  });
  await act(async () => {
    await expect(result.current.reloadFirstPage()).resolves.toBeUndefined();
    await expect(result.current.refetch()).resolves.toBeUndefined();
  });
  expect(API.get).not.toHaveBeenCalled();
});
