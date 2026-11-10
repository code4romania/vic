import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android Back closes what is open on top (a bottom sheet) instead of leaving the screen or the app.
 * The listener added last runs first, so an open sheet wins over the navigation's own handler.
 */
export const useBackToClose = (open: boolean, close: () => void) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [open, close]);
};
