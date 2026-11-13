import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import API from '../api';
import { useMarkNewsSeenMutation, useUnreadNewsCountQuery } from './news.service';

jest.mock('../api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

let mockUnread = 3;

beforeEach(() => {
  mockUnread = 3;
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.mocked(API.get).mockReset();
  jest.mocked(API.get).mockImplementation(async () => ({ data: { unread: mockUnread } }));
  jest.mocked(API.post).mockReset();
  jest.mocked(API.post).mockImplementation(async () => {
    mockUnread = 0;
    return { data: undefined, status: 204 };
  });
});

afterEach(() => {
  queryClient.clear();
});

describe('unread news (the badge on the Home bell)', () => {
  it('reads the count from GET /mobile/news/unread-count', async () => {
    const { result } = await renderHook(() => useUnreadNewsCountQuery(), { wrapper });
    await waitFor(() => expect(result.current.data).toBe(3));
    expect(API.get).toHaveBeenCalledWith('/mobile/news/unread-count');
  });

  it('marking „Noutăți” seen posts once and brings the count to 0', async () => {
    const { result } = await renderHook(
      () => ({ count: useUnreadNewsCountQuery(), seen: useMarkNewsSeenMutation() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.count.data).toBe(3));

    await act(async () => {
      await result.current.seen.mutateAsync();
    });

    expect(API.post).toHaveBeenCalledTimes(1);
    expect(API.post).toHaveBeenCalledWith('/mobile/news/seen');
    await waitFor(() => expect(result.current.count.data).toBe(0));
    // the count was refetched from the server after the change
    expect(jest.mocked(API.get).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
