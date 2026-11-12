// Stepper „Îndrăzneț”: a white 72pt bar, − on paper, + on yellow (52×52, radius 18, press .88 on the
// snappy spring) and the value in the middle („4h”) that rolls: the old number slides out and the
// new one slides in, up when it grows and down when it shrinks, clipped in a 44pt window.
// For VoiceOver / TalkBack the whole bar is one adjustable element (swipe up / down).
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { palette } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';
import { MinusIcon, PlusIcon } from '../icons';
import { FieldError, FieldLabel, useErrorShake } from './TextField';

export interface StepperProps {
  /** shown above the bar and read by screen readers */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** visible value, e.g. v => `${v}h` */
  formatValue?: (value: number) => string;
  /** spoken value, e.g. v => `${v} ore`; defaults to formatValue */
  accessibilityValueText?: (value: number) => string;
  error?: string | null;
  disabled?: boolean;
  /** hide the label above the bar (it is still read by screen readers) */
  hideLabel?: boolean;
  required?: boolean;
  decrementLabel?: string;
  incrementLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const WINDOW = 44;

const StepButton = ({
  kind,
  onPress,
  disabled,
  label,
  testID,
}: {
  kind: 'minus' | 'plus';
  onPress: () => void;
  disabled: boolean;
  label: string;
  testID: string;
}) => {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : interpolate(pressed.value, [0, 1], [1, 0.88]) }],
  }));
  const Icon = kind === 'minus' ? MinusIcon : PlusIcon;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      style={disabled ? styles.off : null}
    >
      <Animated.View style={[styles.button, kind === 'plus' ? styles.plus : styles.minus, scale]}>
        <Icon size={24} color={palette.navy} strokeWidth={2.6} />
      </Animated.View>
    </Pressable>
  );
};

export const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  formatValue = (v) => `${v}`,
  accessibilityValueText,
  error,
  disabled = false,
  hideLabel = false,
  required,
  decrementLabel = 'Scade',
  incrementLabel = 'Crește',
  testID = 'stepper',
  style,
}: StepperProps) => {
  const reduced = useReducedMotion();
  const shake = useErrorShake(error);
  const current = Number.isFinite(value) ? value : 0;

  // the number that rolls out, and which way
  const last = useRef(current);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const roll = useSharedValue(1);

  useEffect(() => {
    if (last.current === current) {
      return;
    }
    setPrevious(last.current);
    setDirection(current > last.current ? 1 : -1);
    last.current = current;
    roll.value = withSequence(withTiming(0, { duration: 0 }), springTo(1, 'snappy', reduced));
  }, [current, reduced, roll]);

  const incoming = useAnimatedStyle(
    () => ({
      opacity: roll.value,
      transform: [{ translateY: (1 - roll.value) * WINDOW * direction }],
    }),
    [direction],
  );
  const outgoing = useAnimatedStyle(
    () => ({
      opacity: 1 - roll.value,
      transform: [{ translateY: -roll.value * WINDOW * direction }],
    }),
    [direction],
  );

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const canDown = !disabled && current > min;
  const canUp = !disabled && current < max;
  const change = (delta: number) => {
    const next = clamp(current + delta * step);
    if (next === current || disabled) {
      return;
    }
    haptics.selection();
    onChange(next);
  };

  const onAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') {
      change(1);
    }
    if (event.nativeEvent.actionName === 'decrement') {
      change(-1);
    }
  };

  const spoken = (accessibilityValueText ?? formatValue)(current);

  return (
    <View style={style}>
      {!hideLabel && <FieldLabel label={label} required={required} />}
      <Animated.View
        testID={testID}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{
          min,
          max: max === Number.MAX_SAFE_INTEGER ? undefined : max,
          now: current,
          text: spoken,
        }}
        accessibilityState={{ disabled }}
        accessibilityActions={[
          { name: 'increment', label: incrementLabel },
          { name: 'decrement', label: decrementLabel },
        ]}
        onAccessibilityAction={onAction}
        style={[styles.bar, error ? styles.barError : null, shake]}
      >
        <StepButton
          kind="minus"
          onPress={() => change(-1)}
          disabled={!canDown}
          label={decrementLabel}
          testID={`${testID}-minus`}
        />
        <View style={styles.window}>
          {previous !== null && (
            <Animated.View
              style={[styles.layer, outgoing]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Text style={styles.number} maxFontSizeMultiplier={1}>
                {formatValue(previous)}
              </Text>
            </Animated.View>
          )}
          <Animated.View style={[styles.layer, incoming]}>
            {/* 40pt is already large, so this number does not scale further */}
            <Text style={styles.number} maxFontSizeMultiplier={1} testID={`${testID}-value`}>
              {formatValue(current)}
            </Text>
          </Animated.View>
        </View>
        <StepButton
          kind="plus"
          onPress={() => change(1)}
          disabled={!canUp}
          label={incrementLabel}
          testID={`${testID}-plus`}
        />
      </Animated.View>
      <FieldError message={error} />
    </View>
  );
};

export default Stepper;

const styles = StyleSheet.create((theme) => ({
  bar: {
    height: 72,
    borderRadius: theme.radius.row,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barError: { borderColor: theme.colors.danger, backgroundColor: theme.colors.errorTint },
  button: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: { backgroundColor: theme.colors.paper },
  plus: { backgroundColor: theme.colors.yellow },
  off: { opacity: 0.45 },
  window: { height: WINDOW, minWidth: 90, overflow: 'hidden', justifyContent: 'center' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, height: WINDOW },
  number: {
    fontFamily: theme.fontFamily.display,
    fontSize: 40,
    lineHeight: WINDOW,
    letterSpacing: -1.6,
    fontVariant: ['tabular-nums'],
    color: theme.colors.text,
    textAlign: 'center',
  },
}));
