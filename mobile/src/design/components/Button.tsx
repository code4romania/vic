// Button „Îndrăzneț”. Variants: primary (yellow, one per screen), secondary (navy), outline,
// destructive. Sizes L 56 / M 44 / S 34, radius 20 / 16 / 14. Pressed: scale .96 with the snappy
// spring, a darker fill and a tighter shadow. Loading: a small rotating hexagon replaces the label
// and the button keeps its width. Disabled: 45% opacity.
import React, { ReactNode, useEffect } from 'react';
import { Insets, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { elevation, hit, palette } from '../tokens';
import { springTo } from '../motion';
import { HexagonIcon } from '../icons';
import { AppText } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
export type ButtonSize = 'L' | 'M' | 'S';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** element before the label, e.g. a lucide icon */
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** stretch to the width of the parent */
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** spoken label when the visible one is shortened; defaults to `label` */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hitSlop?: number | Insets;
  maxFontSizeMultiplier?: number;
}

type Look = { bg: string; pressed: string; fg: string; border?: string };

const LOOKS: Record<ButtonVariant, Look> = {
  primary: { bg: palette.yellow, pressed: palette.yellowPress, fg: palette.navy },
  secondary: { bg: palette.navy, pressed: palette.navy2, fg: palette.white },
  outline: { bg: 'transparent', pressed: palette.line, fg: palette.navy, border: palette.navy },
  destructive: {
    bg: 'transparent',
    pressed: palette.errorTint,
    fg: palette.red,
    border: palette.red,
  },
};

const SIZES: Record<ButtonSize, { height: number; radius: number; padding: number; font: number }> =
  {
    L: { height: 56, radius: 20, padding: 22, font: 16 },
    M: { height: 44, radius: 16, padding: 16, font: 14.5 },
    S: { height: 34, radius: 14, padding: 12, font: 13 },
  };

const PRESSED_SCALE = 0.96;
const SPIN_MS = 900;

/** The loading mark: a small hexagon that turns (still with Reduce Motion). */
const Spinner = ({ color, size, reduced }: { color: string; size: number; reduced: boolean }) => {
  const turn = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      return undefined;
    }
    turn.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1);
    return () => cancelAnimation(turn);
  }, [reduced, turn]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  return (
    <Animated.View style={spin} testID="button-spinner">
      <HexagonIcon size={size} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'L',
  icon,
  loading = false,
  disabled = false,
  full = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  hitSlop,
  maxFontSizeMultiplier,
}: ButtonProps) => {
  const reduced = useReducedMotion();
  const look = LOOKS[variant];
  const dims = SIZES[size];
  const inactive = disabled || loading;
  const pressed = useSharedValue(0);

  const body = useAnimatedStyle(() => {
    const p = pressed.value;
    const scale = reduced ? 1 : interpolate(p, [0, 1], [1, PRESSED_SCALE]);
    return variant === 'primary'
      ? {
          transform: [{ scale }],
          shadowOpacity: interpolate(p, [0, 1], [elevation.yellow.shadowOpacity, 0.25]),
          shadowRadius: interpolate(p, [0, 1], [elevation.yellow.shadowRadius, 3]),
          shadowOffset: { width: 0, height: interpolate(p, [0, 1], [6, 2]) },
        }
      : { transform: [{ scale }] };
  });
  const pressFill = useAnimatedStyle(() => ({ opacity: pressed.value }));

  // a 34pt button still has a 44pt target
  const slop = hitSlop ?? Math.max(0, Math.ceil((hit.min - dims.height) / 2));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={slop}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      style={[full ? styles.full : null, disabled && !loading ? styles.disabled : null, style]}
    >
      <Animated.View
        style={[
          styles.body,
          {
            minHeight: dims.height,
            borderRadius: dims.radius,
            paddingHorizontal: dims.padding,
            backgroundColor: look.bg,
          },
          look.border ? [styles.bordered, { borderColor: look.border }] : null,
          variant === 'primary' ? elevation.yellow : null,
          body,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: dims.radius, backgroundColor: look.pressed },
            pressFill,
          ]}
        />
        {/* the label stays laid out (invisible) while loading, so the width does not jump */}
        <View
          style={[styles.content, loading ? styles.hidden : null]}
          accessibilityElementsHidden={loading}
          importantForAccessibility={loading ? 'no-hide-descendants' : 'auto'}
        >
          {icon}
          <AppText
            variant="button"
            color={look.fg}
            {...(maxFontSizeMultiplier !== undefined ? { maxFontSizeMultiplier } : {})}
            style={[styles.label, { fontSize: dims.font }]}
          >
            {label}
          </AppText>
        </View>
        {loading && (
          <View style={styles.spinner} pointerEvents="none">
            <Spinner color={look.fg} size={size === 'S' ? 16 : 20} reduced={reduced} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create((theme) => ({
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space.xs,
  },
  content: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.xs },
  hidden: { opacity: 0 },
  bordered: { borderWidth: 2 },
  label: { flexShrink: 1, textAlign: 'center' },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
