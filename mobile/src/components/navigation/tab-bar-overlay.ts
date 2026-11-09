import { useEffect, useSyncExternalStore } from 'react';

// Bottom sheets drawn inside a tab screen sit below the floating tab bar, which would cover their
// buttons. Every open sheet registers here and the bar steps aside until the last one closes.
let openOverlays = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => openOverlays > 0;

/** true while any bottom sheet is open */
export const useTabBarOverlayOpen = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

/** Keeps the tab bar hidden while `open` is true (and releases it on unmount). */
export const useHideTabBarWhile = (open: boolean) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    openOverlays += 1;
    emit();
    return () => {
      openOverlays = Math.max(0, openOverlays - 1);
      emit();
    };
  }, [open]);
};

/** for tests */
export const resetTabBarOverlays = () => {
  openOverlays = 0;
  emit();
};
