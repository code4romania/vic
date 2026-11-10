import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useActivateOrganization } from './organization.service';
import { switchOrganization } from './organization.api';
import useStore from '../../store/store';

jest.mock('./organization.api', () => ({ switchOrganization: jest.fn() }));

const switchCall = switchOrganization as jest.Mock;
const org = (id: string) => ({ id, name: id, logo: '', volunteerId: `v-${id}` }) as any;

const setup = async () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = await renderHook(() => useActivateOrganization(), { wrapper });
  return result;
};

beforeEach(() => {
  switchCall.mockReset();
  useStore.setState({ userProfile: { activeOrganization: org('a'), myOrganizations: [] } as any });
});

describe('useActivateOrganization (audit #23)', () => {
  it('resolves only once the backend switched', async () => {
    let finish: () => void = () => undefined;
    switchCall.mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    const result = await setup();

    let done = false;
    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.activate(org('b')).then(() => {
        done = true;
      });
    });
    expect(switchCall).toHaveBeenCalledWith('b');
    expect(useStore.getState().userProfile?.activeOrganization?.id).toBe('b');
    expect(done).toBe(false);

    await act(async () => {
      finish();
      await pending;
    });
    expect(done).toBe(true);
  });

  it('a failed switch brings the previous organization back and rejects', async () => {
    switchCall.mockRejectedValue(new Error('offline'));
    const result = await setup();

    await act(async () => {
      await expect(result.current.activate(org('b'))).rejects.toThrow('offline');
    });
    expect(useStore.getState().userProfile?.activeOrganization?.id).toBe('a');
  });

  it('the active organization is not switched again', async () => {
    const result = await setup();
    await act(() => result.current.activate(org('a')));
    expect(switchCall).not.toHaveBeenCalled();
  });
});
