import React, { ReactNode, useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { VText } from './VText';
import { colors, radius } from '../../common/theme/tokens';

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
}

const palette: Record<
  VButtonVariant,
  { bg: string; pressed: string; fg: string; border?: string }
> = {
  primary: { bg: colors.yellow, pressed: colors.yellowPressed, fg: colors.navy },
  navy: { bg: colors.navy, pressed: colors.navy, fg: colors.white },
  outline: { bg: colors.white, pressed: colors.soft, fg: colors.ink, border: colors.ink },
  soft: { bg: colors.soft, pressed: colors.line, fg: colors.ink },
  danger: { bg: colors.danger, pressed: colors.danger, fg: colors.white },
};

/**
 * VIC 2.0 button. Yellow (`primary`) is only for the main action of a screen, with navy text.
 * Minimum heights: 52 (regular) and 36 (small pill); labels can wrap.
 */
export const VButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  loading,
  disabled,
  icon,
  style,
  testID,
  accessibilityHint,
}: VButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <PressableScale
      testID={testID}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        size === 'small' ? styles.small : styles.regular,
        { backgroundColor: pressed ? p.pressed : p.bg },
        p.border ? [styles.bordered, { borderColor: p.border }] : null,
        inactive && !loading ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <VText
            variant="button"
            color={p.fg}
            style={[styles.label, size === 'small' ? styles.smallLabel : null]}
          >
            {label}
          </VText>
        </View>
      )}
    </PressableScale>
  );
};

export default VButton;

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  regular: {
    minHeight: 52,
    paddingVertical: 12,
    borderRadius: radius.button,
    paddingHorizontal: 20,
  },
  small: { minHeight: 36, paddingVertical: 6, borderRadius: 18, paddingHorizontal: 14 },
  label: { flexShrink: 1, textAlign: 'center' },
  smallLabel: { fontSize: 14 },
  content: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.4 },
  bordered: { borderWidth: 1 },
});
