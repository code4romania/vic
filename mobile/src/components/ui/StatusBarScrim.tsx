import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../common/theme/tokens';

/**
 * Background behind the status bar on full-bleed screens, so content scrolling up doesn't run under
 * the clock and the battery.
 */
export const StatusBarScrim = ({ color = colors.canvas }: { color?: string }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      style={[styles.scrim, { height: insets.top, backgroundColor: color }]}
      testID="status-bar-scrim"
    />
  );
};

export default StatusBarScrim;

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
});
