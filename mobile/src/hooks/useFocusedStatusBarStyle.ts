import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';

/**
 * Applies the status bar style whenever the screen gains focus.
 *
 * A declarative <StatusBar /> is not enough here: tab screens stay mounted, so switching tabs
 * never updates RN's StatusBar stack, and on Android edge-to-edge the native side falls back
 * to the system theme (light icons in dark mode, dark icons in light mode).
 */
export const useFocusedStatusBarStyle = (style: StatusBarStyle) => {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setStyle(style, true);
    }, [style]),
  );
};
