import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { VText } from './VText';
import { VButton } from './VButton';
import { StateIcon } from './StateIcon';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** a failed load: the error icon and the "not your fault, try again" line of the canvas board "Stări" */
  error?: boolean;
  testID?: string;
}

/** Centered empty / no-results / error message with an optional action (canvas board "Stări"). */
export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  error,
  testID,
}: EmptyStateProps) => {
  const { t } = useTranslation('general');
  return (
    <View style={styles.empty} testID={testID}>
      {icon ?? (error ? <StateIcon kind="error" size={64} /> : null)}
      <VText variant="h3" style={styles.center} accessibilityRole="header">
        {title}
      </VText>
      {!!(description || error) && (
        <VText variant="sub" style={styles.center}>
          {description || `${t('error.load_hint')}`}
        </VText>
      )}
      {!!actionLabel && onAction && (
        <VButton
          label={actionLabel}
          onPress={onAction}
          variant="navy"
          size="small"
          style={styles.action}
        />
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 8, paddingVertical: 60, paddingHorizontal: 20 },
  center: { textAlign: 'center' },
  action: { marginTop: 10, minHeight: 44, paddingHorizontal: 20 },
});
