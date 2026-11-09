import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { VText } from './VText';
import { colors } from '../../common/theme/tokens';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Centered empty / no-results message with an optional underlined action (canvas `.empty`). */
export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) => (
  <View style={styles.empty} testID={testID}>
    {icon}
    <VText variant="h3" style={styles.center}>
      {title}
    </VText>
    {!!description && (
      <VText variant="sub" style={styles.center}>
        {description}
      </VText>
    )}
    {!!actionLabel && onAction && (
      <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={styles.action}>
        <VText variant="label" color={colors.ink} style={styles.link}>
          {actionLabel}
        </VText>
      </Pressable>
    )}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60, paddingHorizontal: 20 },
  center: { textAlign: 'center' },
  action: { marginTop: 6 },
  link: { fontFamily: 'roboto-bold', textDecorationLine: 'underline' },
});
