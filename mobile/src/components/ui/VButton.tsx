import React, { ReactNode } from 'react';
import { Insets, StyleProp, ViewStyle } from 'react-native';
import { Button, ButtonSize, ButtonVariant } from '../../design/components/Button';

export type VButtonVariant = 'primary' | 'navy' | 'outline' | 'soft' | 'danger';

export interface VButtonProps {
  label: string;
  onPress: () => void;
  variant?: VButtonVariant;
  size?: 'regular' | 'small';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityHint?: string;
  /** Spoken label when the visible one is shortened; defaults to `label`. */
  accessibilityLabel?: string;
  hitSlop?: number | Insets | null;
  maxFontSizeMultiplier?: number;
}

// The „Îndrăzneț” button has four variants: the soft (gray) button becomes the outline one and the
// filled red one becomes the red outline (destructive).
const VARIANT: Record<VButtonVariant, ButtonVariant> = {
  primary: 'primary',
  navy: 'secondary',
  outline: 'outline',
  soft: 'outline',
  danger: 'destructive',
};

const SIZE: Record<NonNullable<VButtonProps['size']>, ButtonSize> = { regular: 'L', small: 'S' };

/**
 * Legacy name of the „Îndrăzneț” Button (src/design/components/Button). Yellow (`primary`) is only
 * for the main action of a screen, with navy text.
 */
export const VButton = ({
  variant = 'primary',
  size = 'regular',
  hitSlop,
  ...props
}: VButtonProps) => (
  <Button {...props} variant={VARIANT[variant]} size={SIZE[size]} hitSlop={hitSlop ?? undefined} />
);

export default VButton;
