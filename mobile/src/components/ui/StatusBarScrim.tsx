import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../common/theme/tokens';

/**
 * Keeps the status bar readable on scrolling tab screens: content scrolls under a white strip as
 * tall as the top inset instead of under the clock and battery.
 */
export const StatusBarScrim = () => {
  const insets = useSafeAreaInsets();
  return <View pointerEvents="none" style={[styles.scrim, { height: insets.top }]} />;
};

export default StatusBarScrim;

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.white },
});
