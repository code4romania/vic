// Full-screen system state „Îndrăzneț” (maintenance, update required): paper, the VIC hexagon
// floating slowly, a big Bricolage title, one sentence and the one yellow button at the bottom.
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { StatusBar } from 'expo-status-bar';
import { FloatingHexagon } from '../design/components/EmptyState';
import { AppText } from '../design/components/Text';
import { Button } from '../design/components/Button';
import { enter } from '../design/motion';
import { palette } from '../design/tokens';

export interface SystemStateProps {
  /** small line above the title, e.g. "VIC" */
  kicker?: string;
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  loading?: boolean;
  /** extra content under the description */
  children?: ReactNode;
  testID?: string;
}

export const SystemState = ({
  kicker,
  title,
  description,
  actionLabel,
  onAction,
  loading,
  children,
  testID,
}: SystemStateProps) => {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      testID={testID}
    >
      {/* rendered outside the navigators (App.tsx), so the status bar is set here, not on focus */}
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Animated.View entering={enter(0, reduced)}>
          <FloatingHexagon size={88} />
        </Animated.View>
        <Animated.View entering={enter(1, reduced)} style={styles.copy}>
          {!!kicker && (
            <AppText variant="overline" color={palette.ink2} style={styles.center}>
              {kicker}
            </AppText>
          )}
          <AppText variant="largeTitle" accessibilityRole="header" style={styles.title}>
            {title}
          </AppText>
          {!!description && (
            <AppText color={palette.ink2} style={[styles.center, styles.description]}>
              {description}
            </AppText>
          )}
        </Animated.View>
        {children}
      </View>
      <Animated.View entering={enter(2, reduced)}>
        <Button
          full
          label={actionLabel}
          onPress={onAction}
          loading={loading}
          testID="state-action"
        />
      </Animated.View>
    </View>
  );
};

export default SystemState;

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space.gutter + 2,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  copy: { alignItems: 'center', gap: 10 },
  title: { fontSize: 38, lineHeight: 40, textAlign: 'center' },
  description: { maxWidth: 320 },
  center: { textAlign: 'center' },
}));
