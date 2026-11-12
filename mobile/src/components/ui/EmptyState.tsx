import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { VButton } from './VButton';
import { StateIcon } from './StateIcon';
import { EmptyState as DesignEmptyState } from '../../design/components/EmptyState';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** a failed load: the error icon and the "not your fault, try again" line */
  error?: boolean;
  testID?: string;
}

/**
 * Empty / no-results / error message, legacy API over the „Îndrăzneț” EmptyState: the floating VIC
 * hexagon (or the given icon), a Bricolage title, one sentence and at most one button.
 */
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
    <DesignEmptyState
      testID={testID}
      title={title}
      icon={icon ?? (error ? <StateIcon kind="error" size={64} /> : undefined)}
      description={description || (error ? `${t('error.load_hint')}` : undefined)}
      action={
        !!actionLabel && onAction ? (
          <VButton
            label={actionLabel}
            onPress={onAction}
            variant="navy"
            size="small"
            style={styles.action}
          />
        ) : undefined
      }
    />
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  action: { minHeight: 44, paddingHorizontal: 20 },
});
