import { BackHandler } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useBackToClose } from './useBackToClose';

describe('useBackToClose (audit #12)', () => {
  it('Android Back closes an open sheet and goes no further', async () => {
    const listeners: (() => boolean)[] = [];
    const remove = jest.fn();
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, listener: any) => {
      listeners.push(listener);
      return { remove };
    });
    const close = jest.fn();

    const { rerender, unmount } = await renderHook(
      ({ open }: { open: boolean }) => useBackToClose(open, close),
      { initialProps: { open: false } },
    );
    expect(listeners).toHaveLength(0);

    await rerender({ open: true });
    expect(listeners).toHaveLength(1);
    expect(listeners[0]()).toBe(true);
    expect(close).toHaveBeenCalledTimes(1);

    await rerender({ open: false });
    expect(remove).toHaveBeenCalled();
    await unmount();
  });
});
